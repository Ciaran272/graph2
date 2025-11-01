    function createPieExternalLabelsPlugin(isDarkTheme: boolean) {
        return {
            id: 'pieExternalLabels',
            afterDatasetsDraw(chart: any) {
                const ctx = chart.ctx;
                const meta = chart.getDatasetMeta(0);
                if (!meta || meta.hidden) return;

                const dataset = chart.data.datasets[0];
                const labels = chart.data.labels || [];
                const total = dataset.data.reduce((sum: number, value: number) => sum + value, 0);
                // 使用与标题一致的主题颜色
                const textColor = App.Theme.getThemeTextColor();
                const lineColor = isDarkTheme ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';

                const left: any[] = [];
                const right: any[] = [];

                dataset.data.forEach((value: number, index: number) => {
                    const arc = meta.data[index];
                    if (!arc || !value) return;

                    const percent = value / total;
                    if (!isFinite(percent) || percent <= 0.0005) return;

                    const midAngle = (arc.startAngle + arc.endAngle) / 2;
                    const cos = Math.cos(midAngle);
                    const sin = Math.sin(midAngle);

                    const startX = arc.x + cos * arc.outerRadius;
                    const startY = arc.y + sin * arc.outerRadius;
                    
                    // 根据数据值自适应调整径向线长度
                    const radiusMultiplier = Math.max(0.7, Math.min(1.3, 1 - percent * 0.5));
                    const kneeRadius = arc.outerRadius + 22 * radiusMultiplier;
                    const radialLength = kneeRadius - arc.outerRadius;
                    
                    // 水平线长度不超过径向线长度的80%
                    let horizontalLength = Math.max(15, radialLength * 0.75);
                    if (horizontalLength > radialLength * 0.8) {
                        horizontalLength = radialLength * 0.8;
                    }
                    
                    const kneeX = arc.x + cos * kneeRadius;
                    const kneeY = arc.y + sin * kneeRadius;
                    const endX = kneeX + (cos < 0 ? -horizontalLength : horizontalLength);
                    const endY = kneeY;

                    const entry = {
                        label: labels[index] || `数据 ${index + 1}`,
                        percentText: `${(percent * 100).toFixed(1)}%`,
                        valueText: `${value}`,
                        startX,
                        startY,
                        kneeX,
                        kneeY,
                        endX,
                        endY,
                        baseY: endY,
                        baseX: kneeX,
                        horizontalLength,
                        side: cos < 0 ? 'left' : 'right'
                    };
                    (cos < 0 ? left : right).push(entry);
                });

                const adjust = (items: any[], direction: 'left' | 'right') => {
                    if (items.length <= 1) {
                        items.forEach(item => {
                            item.targetY = item.baseY;
                            item.align = direction === 'left' ? 'right' : 'left';
                        });
                        return;
                    }
                    items.sort((a, b) => a.baseY - b.baseY);
                    const gap = 28;
                    let lastY = items[0].baseY;
                    items[0].targetY = lastY;
                    for (let i = 1; i < items.length; i++) {
                        let desired = items[i].baseY;
                        if (desired - lastY < gap) {
                            desired = lastY + gap;
                        }
                        items[i].targetY = desired;
                        lastY = desired;
                    }
                    const first = items[0];
                    const last = items[items.length - 1];
                    const centerShift = ((first.baseY + last.baseY) / 2) - ((first.targetY + last.targetY) / 2);
                    items.forEach(item => {
                        item.targetY = (item.targetY ?? item.baseY) + centerShift;
                        item.align = 'center';
                        const span = item.horizontalLength ?? Math.abs(item.endX - item.kneeX);
                        item.endX = item.kneeX + (direction === 'left' ? -span : span);
                    });
                };

                adjust(left, 'left');
                adjust(right, 'right');

                [...left, ...right].forEach(item => {
                    const targetY = item.targetY ?? item.baseY;
                    const kneeY = targetY;
                    const endY = targetY;
                    ctx.save();
                    ctx.strokeStyle = lineColor;
                    ctx.lineWidth = 1.2;
                    ctx.beginPath();
                    ctx.moveTo(item.startX, item.startY);
                    ctx.lineTo(item.kneeX, kneeY);
                    ctx.lineTo(item.endX, endY);
                    ctx.stroke();

                    ctx.fillStyle = textColor;
                    ctx.textBaseline = 'middle';
                    ctx.textAlign = 'center';

                    const lines: Array<{ text: string; font: string }> = [
                        { text: item.label ?? '', font: '600 15px "Inter", sans-serif' },
                        { text: item.percentText ?? '', font: '600 13px "Inter", sans-serif' }
                    ];
                    if (item.valueText) {
                        lines.push({ text: item.valueText, font: '12px "Inter", sans-serif' });
                    }

                    let maxWidth = 0;
                    lines.forEach(line => {
                        if (!line.text) return;
                        ctx.font = line.font;
                        const width = ctx.measureText(line.text).width;
                        if (width > maxWidth) {
                            maxWidth = width;
                        }
                    });

                    const offsetBase = item.horizontalLength ?? Math.abs(item.endX - item.kneeX) ?? 20;
                    const margin = Math.max(10, Math.min(24, offsetBase * 0.6));
                    const anchorX = item.side === 'left'
                        ? item.endX - margin - maxWidth / 2
                        : item.endX + margin + maxWidth / 2;

                    ctx.font = lines[0].font;
                    ctx.fillText(lines[0].text, anchorX, endY - 12);
                    ctx.font = lines[1].font;
                    ctx.fillText(lines[1].text, anchorX, endY + 2);
                    if (item.valueText) {
                        const valueFont = '12px "Inter", sans-serif';
                        ctx.font = valueFont;
                        ctx.fillText(item.valueText, anchorX, endY + 14);
                    }
                    ctx.restore();
                });
            }
        };
    }

/// <reference path="../app.types.ts" />
/// <reference path="../app.constants.ts" />
/// <reference path="../app.state.ts" />
/// <reference path="../utils/color.ts" />
/// <reference path="../utils/data.ts" />
/// <reference path="../utils/dom.ts" />
/// <reference path="../utils/helpers.ts" />
/// <reference path="./d3.ts" />
namespace App.Renderers.ChartJS {
    export function setChartInstance(instance: any | null): void {
        App.myChart = instance;
    }

    const { COLOR_PALETTES } = App;

    export function applyPalette(key: PaletteKey): void {
        const scheme = COLOR_PALETTES[key] || COLOR_PALETTES.bright;
        App.initialData.datasets.forEach((ds, i) => {
            const color = scheme[i % scheme.length];
            ds.backgroundColor = App.Utils.Color.hexToRgba(color, 0.7);
            ds.borderColor = App.Utils.Color.hexToRgba(color, 1);
        });
        App.currentPaletteKey = key;
    }

    function buildOptions(textColor: string, gridColor: string, hasRightAxis: boolean, chartType?: ChartType) {
        const titleText = chartType ? getChartTitleWithSeries(chartType) : App.DOM.chartTitle.value;
        const isDarkTheme = App.Theme.isDarkTheme();
        const isAreaChart = chartType === 'area' || chartType === 'area-stacked';
        const options: any = {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: App.DOM.orientationVertical.classList.contains('active') ? 'x' : 'y',
            elements: {
                bar: {
                    borderRadius: 6,
                    borderSkipped: false
                },
                line: {
                    // 面积图和堆积面积图不使用全局 tension，避免覆盖数据集级别设置
                    // 其他图表类型可以在这里设置默认值，但数据集级别会覆盖
                    tension: isAreaChart ? undefined : 0.4
                },
                point: {
                    radius: 5,
                    hoverRadius: 8,
                    backgroundColor: '#fff',
                    borderWidth: 2.5,
                    hoverBorderWidth: 3
                }
            },
            plugins: {
                legend: {
                    display: true,
                    labels: { 
                        color: textColor,
                        font: { family: "'Inter', sans-serif" }
                    }
                },
                title: {
                    display: true,
                    text: titleText,
                    color: textColor,
                    font: { 
                        size: 20, 
                        weight: '600',
                        family: "'Inter', sans-serif"
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: textColor },
                    grid: { 
                        color: gridColor,
                        lineWidth: 0.8,
                        drawBorder: false,
                        drawTicks: false
                    },
                    title: {
                        display: !!App.DOM.xAxisTitle?.value,
                        text: App.DOM.xAxisTitle?.value || '',
                        color: textColor,
                        font: { 
                            size: 14, 
                            weight: '600',
                            family: "'Inter', sans-serif"
                        }
                    }
                },
                y: {
                    ticks: { color: textColor },
                    grid: { 
                        color: gridColor,
                        lineWidth: 0.8,
                        drawBorder: false,
                        drawTicks: false
                    },
                    title: {
                        display: !!App.DOM.yAxisLeftTitle?.value,
                        text: App.DOM.yAxisLeftTitle?.value || '',
                        color: textColor,
                        font: { 
                            size: 14, 
                            weight: '600',
                            family: "'Inter', sans-serif"
                        }
                    }
                }
            }
        };

        if (hasRightAxis) {
            options.scales.y1 = {
                position: 'right',
                ticks: { color: textColor },
                grid: {
                    drawOnChartArea: false,
                    color: gridColor
                },
                title: {
                    display: !!App.DOM.yAxisRightTitle?.value,
                    text: App.DOM.yAxisRightTitle?.value || '',
                    color: textColor,
                    font: { size: 14, weight: '600' }
                }
            };
        }

        return options;
    }

    function buildDatasets(): any[] {
        return App.initialData.datasets
            .filter(ds => ds.visible !== false)
            .map(ds => {
                const base: any = {
                    label: ds.label,
                    data: [...ds.data],
                    backgroundColor: ds.backgroundColor,
                    borderColor: ds.borderColor,
                    borderWidth: ds.borderWidth,
                    yAxisID: ds.yAxisID || 'y',
                    linePointStyle: ds.linePointStyle,
                    lineBorderWidth: ds.lineBorderWidth,
                    pointStyle: ds.pointStyle,
                    pointRadius: ds.pointRadius,
                    pointHoverRadius: ds.pointHoverRadius,
                    options: ds.options ? { ...ds.options } : undefined,
                    stack: ds.stack
                };
                if (typeof ds.type === 'string') {
                    base.type = ds.type;
                }
                return base;
            });
    }

    function buildPiePalette(): string[] {
        return COLOR_PALETTES[App.currentPaletteKey] || COLOR_PALETTES.bright;
    }

    function getSelectedSeriesInfo(): { index: number; dataset: any; label: string } | null {
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
            const label = selectedDataset.label || `对比量 ${selectedIndex + 1}`;
            return { index: selectedIndex, dataset: selectedDataset, label };
        }
        return null;
    }

    function getChartTitleWithSeries(chartType: ChartType): string {
        const baseTitle = App.DOM.chartTitle.value || '我的图表';
        const needsSeries = ['pie', 'donut', 'histogram', 'treemap'].includes(chartType);
        
        if (needsSeries) {
            const seriesInfo = getSelectedSeriesInfo();
            if (seriesInfo) {
                return `${baseTitle} - ${seriesInfo.label}`;
            }
        }
        
        return baseTitle;
    }

    export function renderChart(): void {
        const chartType = App.DOM.chartType.value as ChartType;
        const backgroundColor = App.Utils.Color.normalizeColorToHex(App.DOM.exportBg.value);
        const canvas = document.getElementById('myChart') as HTMLCanvasElement;
        const svg = document.getElementById('d3Chart') as unknown as SVGSVGElement;
        canvas.style.backgroundColor = backgroundColor;
        svg.style.backgroundColor = backgroundColor;

        App.UI.Visibility.updateControlVisibility(chartType);

        if (chartType === 'streamgraph') {
            App.Renderers.D3.renderStreamgraph();
            App.UI.Visibility.updateSeriesNote('');
            return;
        }

        if (chartType === 'treemap') {
            App.Renderers.D3.renderTreemap();
            const singleSeriesSelect = document.getElementById('single-series-select') as HTMLSelectElement;
            let selectedIndex = 0;
            if (singleSeriesSelect && !singleSeriesSelect.disabled) {
                selectedIndex = parseInt(singleSeriesSelect.value || '0', 10);
            }
            const selectedDataset = App.initialData.datasets[selectedIndex];
            if (selectedDataset) {
                const noteLabel = selectedDataset.label || `对比量 ${selectedIndex + 1}`;
                App.UI.Visibility.updateSeriesNote(noteLabel);
            }
            return;
        }

        App.Utils.DOM.prepareCanvas(svg, canvas);

        let datasets = buildDatasets();
        const textColor = App.Theme.getThemeTextColor();
        const gridColor = App.Theme.getThemeGridColor();
        const hasRightAxis = datasets.some(ds => ds.yAxisID === 'y1');

        if (chartType !== 'bar-line') {
            datasets = datasets.map(ds => {
                const { type, ...rest } = ds;
                return rest;
            });
        }

        let chartTypeForRender = 'bar';
        let options = buildOptions(textColor, gridColor, hasRightAxis, chartType);

        switch (chartType) {
            case 'histogram': {
                chartTypeForRender = 'bar';
                const singleSeriesSelect = document.getElementById('single-series-select') as HTMLSelectElement;
                let selectedIndex = 0;
                if (singleSeriesSelect && !singleSeriesSelect.disabled) {
                    const candidate = parseInt(singleSeriesSelect.value || '0', 10);
                    if (!Number.isNaN(candidate) && App.initialData.datasets[candidate]) {
                        selectedIndex = candidate;
                    }
                }
                const selectedDataset = App.initialData.datasets[selectedIndex];
                if (selectedDataset && selectedDataset.visible !== false) {
                    const binsValue = parseInt(App.DOM.histBins?.value || '10', 10);
                    const bins = Math.max(1, Math.min(100, binsValue || 10));
                    const { binLabels, binValues } = App.Utils.Data.computeHistogram(selectedDataset.data, bins);
                    const isDarkTheme = App.Theme.isDarkTheme();
                    datasets = [{
                        label: `${selectedDataset.label} 直方图`,
                        data: binValues,
                        backgroundColor: selectedDataset.backgroundColor,
                        borderColor: isDarkTheme ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                        borderWidth: 1
                    }];
                    const originalLabels = App.initialData.labels;
                    App.initialData.labels = binLabels;
                    setTimeout(() => {
                        App.initialData.labels = originalLabels;
                    }, 100);
                    
                    // 直方图柱子样式优化
                    options.datasets = {
                        bar: {
                            barPercentage: 0.95,
                            categoryPercentage: 1.0
                        }
                    };
                    
                    // 直方图X轴标签优化：bin数量多时自动倾斜和隔行显示
                    if (bins > 15) {
                        options.scales = options.scales || {};
                        options.scales.x = options.scales.x || {};
                        options.scales.x.ticks = {
                            ...options.scales.x.ticks,
                            maxRotation: 45,
                            minRotation: 45,
                            autoSkip: true,
                            maxTicksLimit: Math.ceil(bins / 2)
                        };
                    } else if (bins > 8) {
                        options.scales = options.scales || {};
                        options.scales.x = options.scales.x || {};
                        options.scales.x.ticks = {
                            ...options.scales.x.ticks,
                            maxRotation: 30,
                            minRotation: 0,
                            autoSkip: false
                        };
                    }
                    
                    const noteLabel = selectedDataset.label || `对比量 ${selectedIndex + 1}`;
                    App.UI.Visibility.updateSeriesNote(noteLabel);
                } else {
                    App.UI.Visibility.updateSeriesNote('');
                }
                options.indexAxis = 'x';
                break;
            }
            case 'bar-line': {
                chartTypeForRender = 'bar';
                datasets = datasets.map(ds => {
                    const mixedType = ds.type || 'bar';
                    const result = { ...ds, type: mixedType };
                    if (mixedType === 'bar') {
                        Object.assign(result, {
                            backgroundColor: App.Utils.Color.adjustRgbaAlpha(ds.backgroundColor, 0.5),
                            borderWidth: 0,
                            borderRadius: 4
                        });
                    } else if (mixedType === 'line') {
                        const pointStyle = ds.linePointStyle || ds.pointStyle || 'circle';
                        const lineWidth = typeof ds.lineBorderWidth === 'number'
                            ? ds.lineBorderWidth
                            : typeof ds.borderWidth === 'number'
                                ? ds.borderWidth
                                : 3;
                        const pointRadius = typeof ds.pointRadius === 'number' ? ds.pointRadius : 5;
                        const pointHoverRadius = typeof ds.pointHoverRadius === 'number'
                            ? ds.pointHoverRadius
                            : 8;
                        Object.assign(result, {
                            tension: 0.4,
                            fill: false,
                            pointStyle,
                            borderWidth: lineWidth,
                            pointRadius,
                            pointHoverRadius,
                            pointBackgroundColor: '#fff',
                            pointBorderColor: ds.borderColor,
                            pointBorderWidth: 2.5,
                            order: -1
                        });
                    }
                    return result;
                });
                App.UI.Visibility.updateSeriesNote('');
                break;
            }
            case 'pie':
            case 'donut': {
                chartTypeForRender = chartType === 'donut' ? 'doughnut' : 'pie';
                const cutoutValue = parseInt(App.DOM.donutCutout?.value || '50', 10);
                const cutout = Math.max(0, Math.min(90, cutoutValue));
                const radiusValue = parseInt(App.DOM.pieRadius?.value || '65', 10);
                const radiusPercentage = Math.max(10, Math.min(100, radiusValue));
                options.indexAxis = 'x';
                options.scales = { x: { display: false }, y: { display: false } };
                options.layout = {
                    padding: {
                        top: 24,
                        bottom: 24,
                        left: 24,
                        right: 24
                    }
                };
                options.plugins.legend = { display: false };
                delete options.animation;
                const palette = buildPiePalette();
                const pieSeriesSelect = document.getElementById('single-series-select') as HTMLSelectElement;
                let pieSelectedIndex = 0;
                if (pieSeriesSelect && !pieSeriesSelect.disabled) {
                    pieSelectedIndex = parseInt(pieSeriesSelect.value || '0', 10);
                }
                const pieDataset = App.initialData.datasets[pieSelectedIndex];
                if (pieDataset) {
                    datasets = [{
                        label: pieDataset.label,
                        data: [...pieDataset.data],
                        backgroundColor: palette.map(color => App.Utils.Color.hexToRgba(color, 1.0)),  // 使用完全不透明，避免渲染问题
                        borderColor: '#fff',
                        borderWidth: 3  // 增加边框宽度，让间隙更明显
                    }];
                    if (chartType === 'donut') {
                        options.cutout = `${cutout}%`;
                    }
                    options.radius = `${radiusPercentage}%`;
                    options.plugins.pieExternalLabels = createPieExternalLabelsPlugin(App.Theme.isDarkTheme());
                    App.UI.Visibility.updateSeriesNote(pieDataset.label || `对比量 ${pieSelectedIndex + 1}`);
                }
                break;
            }
            case 'line':
            case 'area':
            case 'area-stacked':
            case 'radar': {
                if (chartType === 'radar') {
                    chartTypeForRender = 'radar';
                    const isDarkTheme = App.Theme.isDarkTheme();
                    options = {
                        ...options,
                        layout: {
                            padding: { top: 30, right: 30, bottom: 30, left: 30 }
                        },
                        scales: {
                            r: {
                                angleLines: { 
                                    display: true, 
                                    color: isDarkTheme ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
                                    lineWidth: 1.5
                                },
                                suggestedMin: 0,
                                ticks: {
                                    display: false,
                                    showLabelBackdrop: false,
                                    color: '#000000',
                                    callback: (value: number | string) => `${value}`,
                                    font: { size: 11, weight: '500' },
                                    padding: 8
                                },
                                grid: { 
                                    display: true, 
                                    color: isDarkTheme ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                                    lineWidth: 1.5,
                                    circular: true
                                },
                                pointLabels: { display: true, color: textColor, font: { size: 12, weight: 'bold' }, padding: 15 }
                            }
                        }
                    };
                    const radarOpacityValue = parseInt(App.DOM.areaOpacity?.value || '35', 10);
                    const radarOpacity = Math.max(0, Math.min(100, radarOpacityValue)) / 100;
                    datasets = datasets.map(ds => {
                        const { type, yAxisID, ...radarData } = ds;
                        const fillColor = App.Utils.Color.adjustRgbaAlpha(ds.backgroundColor, radarOpacity);
                        return {
                            ...radarData,
                            fill: 'origin',
                            backgroundColor: fillColor,
                            borderWidth: 2.5,
                            tension: 0,
                            pointRadius: 5,
                            pointHoverRadius: 8,
                            pointBackgroundColor: '#fff',
                            pointBorderWidth: 2,
                            segment: {
                                borderColor: ds.borderColor,
                                backgroundColor: fillColor
                            }
                        };
                    });
                    options.plugins = {
                        ...options.plugins,
                        radarAxisLabels: {
                            id: 'radarAxisLabels',
                            afterDatasetsDraw(chart: any) {
                                const chartCtx = chart.ctx;
                                const scale = chart.scales.r;
                                const labels = chart.data.labels;
                                const scaleMax = typeof scale.max === 'number' ? scale.max : 20;
                                
                                // 动态计算刻度值
                                let tickValues: number[] = [];
                                if (scaleMax <= 5) {
                                    // 小数据: [1, 2, 3, 4, 5]
                                    tickValues = [1, 2, 3, 4, 5].filter(v => v <= scaleMax);
                                } else if (scaleMax <= 10) {
                                    // 中小数据: [2, 4, 6, 8, 10]
                                    tickValues = [2, 4, 6, 8, 10].filter(v => v <= scaleMax);
                                } else if (scaleMax <= 20) {
                                    // 中等数据: [4, 8, 12, 16, 20]
                                    tickValues = [4, 8, 12, 16, 20].filter(v => v <= scaleMax);
                                } else if (scaleMax <= 50) {
                                    // 中大数据: [10, 20, 30, 40, 50]
                                    tickValues = [10, 20, 30, 40, 50].filter(v => v <= scaleMax);
                                } else if (scaleMax <= 100) {
                                    // 大数据: [20, 40, 60, 80, 100]
                                    tickValues = [20, 40, 60, 80, 100].filter(v => v <= scaleMax);
                                } else {
                                    // 超大数据: 动态计算5个均匀刻度
                                    const step = Math.ceil(scaleMax / 5);
                                    const roundedStep = Math.pow(10, Math.floor(Math.log10(step))) * Math.ceil(step / Math.pow(10, Math.floor(Math.log10(step))));
                                    tickValues = [];
                                    for (let i = roundedStep; i < scaleMax; i += roundedStep) {
                                        tickValues.push(i);
                                    }
                                }
                                
                                // 确保包含最大值（如果它不在列表中且与最后一个刻度差距明显）
                                if (tickValues.length > 0 && scaleMax > tickValues[tickValues.length - 1]) {
                                    const lastTick = tickValues[tickValues.length - 1];
                                    if (scaleMax - lastTick > lastTick * 0.15) {
                                        tickValues.push(scaleMax);
                                    }
                                }
                                
                                tickValues = Array.from(new Set(tickValues)).sort((a, b) => a - b);
                                const radarTextColor = App.Theme.getThemeTextColor();
                                labels.forEach((label: string, index: number) => {
                                    const angleInRadians = scale.getIndexAngle(index) - Math.PI / 2;
                                    tickValues.forEach((rawValue: number) => {
                                        if (!Number.isFinite(rawValue) || rawValue <= 0) return;
                                        const radius = scale.getDistanceFromCenterForValue(rawValue);
                                        const x = scale.xCenter + Math.cos(angleInRadians) * radius;
                                        const y = scale.yCenter + Math.sin(angleInRadians) * radius;
                                        chartCtx.save();
                                        chartCtx.font = '600 9px "Inter", sans-serif';
                                        chartCtx.textAlign = 'center';
                                        chartCtx.textBaseline = 'middle';
                                        chartCtx.fillStyle = radarTextColor;
                                        chartCtx.fillText(String(rawValue), x, y);
                                        chartCtx.restore();
                                    });
                                });
                            }
                        }
                    };
                    App.UI.Visibility.updateSeriesNote('');
                } else {
                    chartTypeForRender = chartType === 'line' ? 'line' : 'line';
                    const opacityValue = parseInt(App.DOM.areaOpacity?.value || '35', 10);
                    const opacity = Math.max(0, Math.min(100, opacityValue)) / 100;
                    
                    const isLineChart = chartType === 'line';
                    const isAreaChart = chartType === 'area';
                    const isAreaStackedChart = chartType === 'area-stacked';

                    // 分开处理面积图和堆积面积图，使用与原网页一致的配置
                    if (isAreaChart) {
                        // 普通面积图：使用简单的 fill: true 配置，避免白色条纹
                        datasets = datasets.map((ds) => {
                            const { type, ...rest } = ds;
                            const borderColor = rest.borderColor || rest.backgroundColor;
                            const fillColor = App.Utils.Color.adjustRgbaAlpha(borderColor, opacity);
                            
                            return {
                                ...rest,
                                fill: true,  // 使用 true 而不是 'origin'，避免复杂的自交问题
                                tension: 0.35,  // 与原网页一致
                                borderWidth: typeof rest.borderWidth === 'number' ? rest.borderWidth : 2,
                                pointRadius: typeof rest.pointRadius === 'number' ? rest.pointRadius : 4,
                                pointHoverRadius: typeof rest.pointHoverRadius === 'number' ? rest.pointHoverRadius : 6,
                                backgroundColor: fillColor,
                                borderColor: borderColor,
                                pointBackgroundColor: borderColor,
                                pointBorderColor: borderColor
                            };
                        });
                    } else if (isAreaStackedChart) {
                        // 堆积面积图：使用简单的 fill: true 配置
                        const stackId = 'area-stack';
                        datasets = datasets.map((ds, index) => {
                            const { type, ...rest } = ds;
                            const borderColor = rest.borderColor || rest.backgroundColor;
                            const fillColor = App.Utils.Color.adjustRgbaAlpha(borderColor, opacity);
                            
                            return {
                                ...rest,
                                stack: stackId,
                                fill: true,  // 让 Chart.js 自动处理堆积填充
                                tension: 0.35,  // 与原网页一致
                                borderWidth: typeof rest.borderWidth === 'number' ? rest.borderWidth : 1,
                                pointRadius: typeof rest.pointRadius === 'number' ? rest.pointRadius : 3,
                                pointHoverRadius: typeof rest.pointHoverRadius === 'number' ? rest.pointHoverRadius : 5,
                                backgroundColor: fillColor,
                                borderColor: borderColor,
                                pointBackgroundColor: borderColor,
                                pointBorderColor: borderColor
                            };
                        });
                        
                        options.scales.y.stacked = true;
                        options.scales.x.stacked = true;
                    } else {
                        // 折线图：保持平滑曲线
                        datasets = datasets.map((ds) => {
                            const { type, ...rest } = ds;
                            const borderColor = rest.borderColor || rest.backgroundColor;
                            
                            return {
                                ...rest,
                                fill: false,
                                tension: 0.35,
                                cubicInterpolationMode: 'default',
                                borderWidth: typeof rest.borderWidth === 'number' ? rest.borderWidth : 2,
                                pointRadius: typeof rest.pointRadius === 'number' ? rest.pointRadius : 4,
                                pointHoverRadius: typeof rest.pointHoverRadius === 'number' ? rest.pointHoverRadius : 6,
                                backgroundColor: rest.backgroundColor,
                                borderColor: borderColor,
                                pointBackgroundColor: borderColor,
                                pointBorderColor: borderColor,
                                spanGaps: false
                            };
                        });
                    }
                    
                    // 关键修复：禁用面积图和堆积面积图的动画，避免白色条纹
                    if (isAreaChart || isAreaStackedChart) {
                        options.animation = false;
                    }
                    
                    App.UI.Visibility.updateSeriesNote('');
                }
                break;
            }
            case 'bar-horizontal': {
                chartTypeForRender = 'bar';
                options.indexAxis = 'y';
                options.scales = {
                    x: {
                        beginAtZero: true,
                        grid: { display: true, color: gridColor },
                        ticks: { color: textColor }
                    },
                    y: {
                        grid: { display: false, color: gridColor },
                        ticks: { color: textColor }
                    }
                };
                App.UI.Visibility.updateSeriesNote('');
                break;
            }
            case 'bubble': {
                chartTypeForRender = 'bubble';
                
                // 检查是否使用自定义XY数据
                const useCustomXY = App.DOM.bubbleUseCustomXY?.checked || false;
                let customXValues: number[] = [];
                let customYValues: number[] = [];
                
                if (useCustomXY && App.DOM.bubbleXData && App.DOM.bubbleYData) {
                    customXValues = App.Utils.Data.parseCSVNumbers(App.DOM.bubbleXData.value);
                    customYValues = App.Utils.Data.parseCSVNumbers(App.DOM.bubbleYData.value);
                }
                
                const allDataValues: number[] = [];
                datasets.forEach(ds => {
                    ds.data.forEach(val => {
                        if (typeof val === 'number' && Number.isFinite(val)) {
                            allDataValues.push(Math.abs(val));
                        }
                    });
                });
                
                const dataMin = Math.min(...allDataValues);
                const dataMax = Math.max(...allDataValues);
                const dataRange = dataMax - dataMin || 1;
                
                datasets = datasets.map((ds, datasetIndex) => {
                    const bubbleData = App.initialData.labels.map((label, pointIndex) => {
                        const dataValue = typeof ds.data[pointIndex] === 'number' ? ds.data[pointIndex] : 0;
                        const normalizedValue = (Math.abs(dataValue) - dataMin) / dataRange;
                        
                        let xValue: number;
                        let yValue: number;
                        
                        if (useCustomXY && customXValues.length > pointIndex && customYValues.length > pointIndex) {
                            // 使用用户提供的真实XY坐标
                            xValue = customXValues[pointIndex];
                            yValue = customYValues[pointIndex];
                        } else {
                            // 使用智能分布算法
                            const baseX = pointIndex * (100 / (App.initialData.labels.length - 1 || 1));
                            const offsetX = (Math.random() - 0.5) * 15;
                            xValue = baseX + offsetX + datasetIndex * 5;
                            
                            const baseY = 20 + normalizedValue * 60;
                            const offsetY = (Math.random() - 0.5) * 8;
                            yValue = baseY + offsetY + (datasetIndex - datasets.length / 2) * 3;
                        }
                        
                        const rValue = 5 + normalizedValue * 25 + Math.abs(dataValue) * 0.5;
                        
                        return {
                            x: useCustomXY ? xValue : Math.max(0, Math.min(100, xValue)),
                            y: useCustomXY ? yValue : Math.max(10, Math.min(90, yValue)),
                            r: Math.max(5, Math.min(40, rValue)),
                            label: label,
                            rawValue: dataValue
                        };
                    });
                    return {
                        label: ds.label,
                        data: bubbleData,
                        backgroundColor: App.Utils.Color.adjustRgbaAlpha(ds.backgroundColor, 0.5),
                        borderColor: ds.borderColor,
                        borderWidth: 2.5,
                        hoverBorderWidth: 3,
                        hoverBackgroundColor: App.Utils.Color.adjustRgbaAlpha(ds.backgroundColor, 0.7)
                    };
                });
                options.scales = {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        grace: '5%',
                        grid: { display: true, color: gridColor },
                        ticks: { color: textColor },
                        title: App.DOM.xAxisTitle?.value ? {
                            display: true,
                            text: App.DOM.xAxisTitle.value,
                            color: textColor,
                            font: { size: 13, weight: '600' }
                        } : undefined
                    },
                    y: {
                        type: 'linear',
                        grace: '5%',
                        grid: { display: true, color: gridColor },
                        ticks: { color: textColor },
                        title: App.DOM.yAxisLeftTitle?.value ? {
                            display: true,
                            text: App.DOM.yAxisLeftTitle.value,
                            color: textColor,
                            font: { size: 13, weight: '600' }
                        } : undefined
                    }
                };
                options.plugins = {
                    ...options.plugins,
                    legend: { 
                        display: true,
                        position: 'right',
                        labels: { color: textColor, font: { size: 12 } }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context: any) {
                                const label = context.dataset.label || '';
                                const point = context.raw;
                                const dataLabel = point.label || '';
                                const rawValue = typeof point.rawValue === 'number' ? point.rawValue : 0;
                                const lines = [
                                    `${dataLabel}`,
                                    `${label}`,
                                    `X: ${point.x.toFixed(1)}`,
                                    `Y: ${point.y.toFixed(1)}`
                                ];
                                if (rawValue < 0) {
                                    lines.push(`原始值: ${rawValue} (负数已取绝对值)`);
                                } else {
                                    lines.push(`数据值: ${rawValue}`);
                                }
                                return lines;
                            }
                        }
                    }
                };
                App.UI.Visibility.updateSeriesNote('');
                break;
            }
            default: {
                chartTypeForRender = chartType === 'bar-stacked' ? 'bar' : chartType;
                if (chartType === 'bar' || chartType === 'bar-stacked') {
                    options.datasets = {
                        bar: {
                            barPercentage: 0.85,
                            categoryPercentage: 0.75
                        }
                    };
                }
                if (chartType === 'bar-stacked') {
                    options.scales.y.stacked = true;
                    options.scales.x.stacked = true;
                }
                App.UI.Visibility.updateSeriesNote('');
                break;
            }
        }

        const customPlugins: any[] = [];
        if (options.plugins?.pieExternalLabels) {
            customPlugins.push(options.plugins.pieExternalLabels);
        }
        if (options.plugins?.radarAxisLabels) {
            customPlugins.push(options.plugins.radarAxisLabels);
        }

        const config: any = {
            type: chartTypeForRender,
            data: {
                labels: [...App.initialData.labels],
                datasets
            },
            options,
            plugins: customPlugins
        };

        // 性能优化：尝试使用 update 而不是 destroy+create
        try {
            if (App.myChart && App.myChart.config.type === chartTypeForRender) {
                // 图表类型相同且不需要重建，使用 update（更快）
                App.myChart.data.labels = config.data.labels;
                App.myChart.data.datasets = config.data.datasets;
                App.myChart.options = config.options;
                
                // 折线图使用默认更新，其他图表类型跳过动画
                if (chartType === 'line') {
                    App.myChart.update(); // 默认动画模式
                } else {
                    App.myChart.update('none'); // 跳过动画，性能更好
                }
            } else {
                // 图表类型不同、首次创建，或者是面积图类型，需要重新创建
                if (App.myChart) {
                    App.myChart.destroy();
                    App.Renderers.ChartJS.setChartInstance(null);
                }
                const context = canvas.getContext('2d');
                if (!context) {
                    console.error('无法获取 Canvas 上下文');
                    return;
                }
                const chartInstance = new Chart(context, config);
                App.Renderers.ChartJS.setChartInstance(chartInstance);
            }
        } catch (error) {
            console.error('图表渲染失败:', error);
            // 发生错误时强制重新创建
            if (App.myChart) {
                try {
                    App.myChart.destroy();
                } catch (e) {
                    console.error('销毁旧图表失败:', e);
                }
                App.Renderers.ChartJS.setChartInstance(null);
            }
            const context = canvas.getContext('2d');
            if (context) {
                const chartInstance = new Chart(context, config);
                App.Renderers.ChartJS.setChartInstance(chartInstance);
            }
        }
    }
}
