/// <reference path="../app.types.ts" />
/// <reference path="../app.constants.ts" />
/// <reference path="../app.state.ts" />
/// <reference path="../utils/color.ts" />
/// <reference path="../utils/data.ts" />
/// <reference path="../utils/dom.ts" />
/// <reference path="../utils/helpers.ts" />
namespace App.Renderers.D3 {
    const { COLOR_PALETTES, CHART_CONSTANTS } = App;

    declare const d3: any;

    function ensureD3(): any {
        if (typeof d3 === 'undefined') {
            throw new Error('D3.js 未加载');
        }
        return d3;
    }

    function getSelectedSeriesLabel(): string | null {
        const singleSeriesSelect = document.getElementById('single-series-select') as HTMLSelectElement;
        let selectedIndex = 0;
        if (singleSeriesSelect && !singleSeriesSelect.disabled) {
            const candidate = parseInt(singleSeriesSelect.value || '0', 10);
            if (!Number.isNaN(candidate) && App.initialData.datasets[candidate]) {
                selectedIndex = candidate;
            }
        }
        const selectedDataset = App.initialData.datasets[selectedIndex];
        if (selectedDataset) {
            return selectedDataset.label || `对比量 ${selectedIndex + 1}`;
        }
        return null;
    }

    function getTitleWithSeries(): string {
        const baseTitle = App.DOM.chartTitle.value || '我的图表';
        const seriesLabel = getSelectedSeriesLabel();
        if (seriesLabel) {
            return `${baseTitle} - ${seriesLabel}`;
        }
        return baseTitle;
    }

    function createStack(instance: typeof d3, layers: number) {
        const stackFactory = instance.stack as unknown as () => { keys: (keys: any) => any; offset: (fn: any) => any; order: (fn: any) => any; };
        const stack = stackFactory();
        stack.keys(instance.range(layers));
        stack.offset(instance.stackOffsetWiggle);
        stack.order(instance.stackOrderInsideOut);
        return stack as unknown as (input: any) => any;
    }

    export function renderStreamgraph(): void {
        try {
            const d3Instance = ensureD3();
            const svg = App.Elements.svg;
            const canvas = App.Elements.canvas;
            
            if (!svg || !canvas) {
                console.error('SVG或Canvas元素未找到');
                return;
            }
            
            App.Utils.DOM.prepareSVG(svg, canvas);
            const { width, height } = App.Utils.DOM.sizeSVG(svg);

            const margin = CHART_CONSTANTS.MARGINS.DEFAULT;
            const chartWidth = width - margin.left - margin.right;
            const chartHeight = height - margin.top - margin.bottom;

            const visibleDatasets = App.initialData.datasets.filter(ds => ds.visible !== false);
            if (!visibleDatasets.length) {
                App.Utils.DOM.addSVGTitles(svg, App.DOM.chartTitle.value, width, height);
                return;
        }

        const maxLength = Math.max(...visibleDatasets.map(ds => (ds.data || []).length));
        const labels = App.initialData.labels.slice(0, maxLength);

        const keys = visibleDatasets.map((ds, index) => ds.label || `系列 ${index + 1}`);
        const dataByIndex = labels.map((_, labelIndex) => {
            const entry: Record<string, number> = {};
            visibleDatasets.forEach((ds, dsIndex) => {
                const value = Number(ds.data[labelIndex] ?? 0);
                entry[keys[dsIndex]] = Number.isFinite(value) ? value : 0;
            });
            return entry;
        });

        const stack = d3Instance.stack().keys(keys).offset(d3Instance.stackOffsetWiggle);
        const series = stack(dataByIndex);

        const x = d3Instance.scalePoint()
            .domain(labels)
            .range([0, chartWidth]);

        const yExtent: [number, number] = [
            d3Instance.min(series, s => d3Instance.min(s, d => d[0])) ?? 0,
            d3Instance.max(series, s => d3Instance.max(s, d => d[1])) ?? 0
        ];
        const y = d3Instance.scaleLinear()
            .domain(yExtent)
            .nice()
            .range([chartHeight, 0]);

        const colorByKey = new Map<string, string>();
        visibleDatasets.forEach((ds, index) => {
            const base = typeof ds.backgroundColor === 'string'
                ? App.Utils.Color.ensureSolidColor(ds.backgroundColor, 0.85)
                : App.Utils.Color.hexToRgba(App.getColorPalette(App.currentPaletteKey)[index % App.getColorPalette(App.currentPaletteKey).length], 0.85);
            colorByKey.set(keys[index], base);
        });

        const root = d3Instance.select(svg)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const area = d3Instance.area()
            .x((d, i) => x(labels[i]) ?? 0)
            .y0(d => y(d[0]))
            .y1(d => y(d[1]))
            .curve(d3Instance.curveCatmullRom.alpha(CHART_CONSTANTS.D3.STREAMGRAPH_CURVE_ALPHA));

        root.selectAll('path.layer')
            .data(series)
            .enter()
            .append('path')
            .attr('class', 'layer')
            .attr('d', d => area(d as any))
            .attr('fill', (_, index) => colorByKey.get(keys[index]) || App.Utils.Color.hexToRgba('#4ECDC4', 1.0))
            .attr('opacity', CHART_CONSTANTS.D3.STREAMGRAPH_OPACITY)
            .attr('stroke', '#fff')
            .attr('stroke-width', 0.5);

        const axis = d3Instance.axisBottom(x).tickSize(0).tickPadding(12);
        const axisElement = root.append('g')
            .attr('transform', `translate(0,${chartHeight})`)
            .call(axis as any);

        const textColor = App.Theme.getThemeTextColor();
        axisElement.selectAll('text').attr('fill', textColor);
        axisElement.selectAll('path').attr('stroke', App.Theme.getThemeGridColor());

        // 添加图例
        const legendGroup = d3Instance.select(svg)
            .append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${width / 2}, ${height - 35})`);

        const legendItemWidth = 120; // 每个图例项的宽度
        const legendItemHeight = 20; // 图例项高度
        const legendRectSize = 16; // 色块大小
        const legendSpacing = 8; // 色块和文字间距
        
        // 计算总宽度以居中显示
        const totalWidth = keys.length * legendItemWidth;
        const startX = -totalWidth / 2;

        keys.forEach((key, index) => {
            const legendItem = legendGroup.append('g')
                .attr('transform', `translate(${startX + index * legendItemWidth}, 0)`);

            // 添加色块
            legendItem.append('rect')
                .attr('x', 0)
                .attr('y', 0)
                .attr('width', legendRectSize)
                .attr('height', legendRectSize)
                .attr('fill', colorByKey.get(key) || '#999')
                .attr('rx', 3)
                .attr('ry', 3);

            // 添加文字
            legendItem.append('text')
                .attr('x', legendRectSize + legendSpacing)
                .attr('y', legendRectSize / 2)
                .attr('dy', '0.35em')
                .attr('fill', textColor)
                .attr('font-size', '13')
                .attr('font-weight', '500')
                .text(key);
        });

        App.Utils.DOM.addSVGTitles(svg, App.DOM.chartTitle.value, width, height);
        } catch (error) {
            console.error('渲染流图失败:', error);
            const svg = App.Elements.svg;
            if (svg) {
                App.Utils.DOM.prepareSVG(svg, App.Elements.canvas);
                const { width, height } = App.Utils.DOM.sizeSVG(svg);
                App.Utils.DOM.addSVGTitles(svg, '渲染错误', width, height);
            }
        }
    }

    export function renderTreemap(): void {
        try {
            const d3Instance = ensureD3();
            const svg = App.Elements.svg;
            const canvas = App.Elements.canvas;
            
            if (!svg || !canvas) {
                console.error('SVG或Canvas元素未找到');
                return;
            }
            
            App.Utils.DOM.prepareSVG(svg, canvas);
            const { width, height } = App.Utils.DOM.sizeSVG(svg);

            const margin = CHART_CONSTANTS.MARGINS.COMPACT;
            const innerPadding = 32;
            const chartWidth = width - margin.left - margin.right - innerPadding;
            const chartHeight = height - margin.top - margin.bottom - innerPadding;
            const offsetX = margin.left + innerPadding / 2;
            const offsetY = margin.top + innerPadding / 2;

            const selectedIndex = (() => {
                const singleSeriesSelect = document.getElementById('single-series-select') as HTMLSelectElement;
                if (singleSeriesSelect && !singleSeriesSelect.disabled) {
                    const idx = parseInt(singleSeriesSelect.value || '0', 10);
                    if (!Number.isNaN(idx) && App.initialData.datasets[idx]) {
                        return idx;
                    }
                }
                return 0;
            })();

            const selectedDataset = App.initialData.datasets[selectedIndex];
            if (!selectedDataset) return;

            const validValues = (selectedDataset.data || []).filter(v => typeof v === 'number');
            const labels = App.initialData.labels.slice(0, validValues.length);

            const data = {
                name: selectedDataset.label || `系列 ${selectedIndex + 1}`,
                children: labels.map((label, i) => ({
                    name: label,
                    value: validValues[i] ?? 0
                }))
            };

            const root = d3Instance.hierarchy(data)
                .sum(d => d.value)
                .sort((a, b) => (b.value || 0) - (a.value || 0));

            d3Instance.treemap()
                .size([chartWidth, chartHeight])
                .padding(CHART_CONSTANTS.D3.TREEMAP_PADDING)
                .round(true)(root);

            const baseHex = App.Utils.Color.rgbaToHex(selectedDataset.backgroundColor) || '#4ECDC4';
            const color = (d3Instance.scaleLinear as unknown as () => any)()
                .domain([0, d3Instance.max(validValues) || 1])
                .range([d3Instance.color(baseHex).brighter(1.5) as any, d3Instance.color(baseHex).darker(0.5) as any]);

            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.setAttribute('transform', `translate(${offsetX},${offsetY})`);
            svg.appendChild(g);

            root.leaves().forEach((leaf, index) => {
                const node = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                node.setAttribute('class', 'node');
                node.setAttribute('transform', `translate(${leaf.x0},${leaf.y0})`);

                const rectWidth = Math.max(0, leaf.x1 - leaf.x0);
                const rectHeight = Math.max(0, leaf.y1 - leaf.y0);

                const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttribute('width', String(rectWidth));
                rect.setAttribute('height', String(rectHeight));
                rect.setAttribute('fill', color(validValues[index] || 0));
                rect.setAttribute('stroke', '#fff');
                rect.setAttribute('stroke-width', '2.5');
                rect.setAttribute('rx', '6');
                rect.setAttribute('ry', '6');
                node.appendChild(rect);

                if (rectWidth >= CHART_CONSTANTS.UI.MIN_RECT_WIDTH_FOR_TEXT && rectHeight >= CHART_CONSTANTS.UI.MIN_RECT_HEIGHT_FOR_TEXT) {
                    const areaRatio = (rectWidth * rectHeight) / (width * height);
                    const fontSize = Math.round(CHART_CONSTANTS.FONT_SIZES.TREEMAP_MIN +
                        (CHART_CONSTANTS.FONT_SIZES.TREEMAP_MAX - CHART_CONSTANTS.FONT_SIZES.TREEMAP_MIN) * Math.sqrt(areaRatio));
                    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    text.textContent = `${labels[index]}: ${validValues[index]}`;
                    text.setAttribute('x', String(rectWidth / 2));
                    text.setAttribute('y', String(rectHeight / 2));
                    text.setAttribute('fill', App.Theme.getThemeTextColor());
                    text.setAttribute('font-size', String(fontSize));
                    text.setAttribute('font-weight', 'bold');
                    text.setAttribute('text-anchor', 'middle');
                    text.setAttribute('dominant-baseline', 'middle');
                    node.appendChild(text);
                }

                g.appendChild(node);
            });

            App.Utils.DOM.addSVGTitles(svg, getTitleWithSeries(), width, height);
        } catch (error) {
            console.error('渲染树图失败:', error);
            const svg = App.Elements.svg;
            if (svg) {
                App.Utils.DOM.prepareSVG(svg, App.Elements.canvas);
                const { width, height } = App.Utils.DOM.sizeSVG(svg);
                App.Utils.DOM.addSVGTitles(svg, '渲染错误', width, height);
            }
        }
    }
}
