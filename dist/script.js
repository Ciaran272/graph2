/// <reference path="./app.types.ts" />
var App;
(function (App) {
    App.COLOR_PALETTES = {
        bright: ['#FF6B6B', '#4ECDC4', '#FFD166', '#45B7D1', '#A78BFA', '#00C49A'],
        pastel: ['#FFC8A2', '#A0E7E5', '#B4F8C8', '#FBE7C6', '#C3B1E1', '#FFD6E0'],
        ocean: ['#004E92', '#00A8C5', '#70E1F5', '#28CC9E', '#045DE9', '#00C6FB'],
        sunset: ['#FF9A8B', '#FF6A88', '#FF99AC', '#F6D365', '#FDA085', '#F5576C'],
        mint: ['#00C9A7', '#92FE9D', '#00DBDE', '#4BE1EC', '#7EE8FA', '#E0FFB3'],
        warm: ['#E67E22', '#E74C3C', '#D35400', '#F39C12', '#C0392B', '#F1C40F'],
        cool: ['#2980B9', '#16A085', '#1ABC9C', '#2ECC71', '#3498DB', '#9B59B6']
    };
    App.COLOR_PALETTE_KEYS = Object.keys(App.COLOR_PALETTES);
    function getColorPalette(key) {
        return App.COLOR_PALETTES[key] || App.COLOR_PALETTES.bright;
    }
    App.getColorPalette = getColorPalette;
    App.CHART_CONSTANTS = {
        MARGINS: {
            DEFAULT: { top: 40, right: 40, bottom: 60, left: 40 },
            COMPACT: { top: 60, right: 30, bottom: 30, left: 30 }
        },
        FONT_SIZES: {
            TITLE: 20,
            AXIS_TITLE: 14,
            PIE_LABEL: 16,
            PIE_PERCENTAGE: 14,
            TREEMAP_MIN: 10,
            TREEMAP_MAX: 28
        },
        D3: {
            STREAMGRAPH_OPACITY: 0.85,
            STREAMGRAPH_CURVE_ALPHA: 0.5,
            TREEMAP_PADDING: 3
        },
        UI: {
            MIN_RECT_WIDTH_FOR_TEXT: 40,
            MIN_RECT_HEIGHT_FOR_TEXT: 20,
            TREEMAP_MAX_HEIGHT_RATIO: 0.4
        }
    };
})(App || (App = {}));
/// <reference path="./app.types.ts" />
/// <reference path="./app.constants.ts" />
var App;
(function (App) {
    App.currentPaletteKey = 'bright';
    App.orientation = 'x';
    App.myChart = null;
    App.defaultState = {
        labels: ['数据点 1', '数据点 2', '数据点 3', '数据点 4', '数据点 5'],
        datasets: [
            {
                label: '对比量 1',
                data: [12, 19, 3, 5, 2],
                backgroundColor: 'rgba(255, 107, 107, 0.7)',
                borderColor: 'rgba(255, 107, 107, 1)',
                borderWidth: 2,
                type: 'bar',
                yAxisID: 'y',
                linePointStyle: 'circle',
                lineBorderWidth: 2,
                lineFill: false,
                visible: true
            },
            {
                label: '对比量 2',
                data: [7, 11, 5, 8, 3],
                backgroundColor: 'rgba(78, 205, 196, 0.7)',
                borderColor: 'rgba(78, 205, 196, 1)',
                borderWidth: 2,
                type: 'bar',
                yAxisID: 'y',
                linePointStyle: 'circle',
                lineBorderWidth: 2,
                lineFill: false,
                visible: true
            }
        ]
    };
    App.cloneState = (source) => {
        if (typeof structuredClone === 'function') {
            return structuredClone(source);
        }
        return JSON.parse(JSON.stringify(source));
    };
    App.initialData = App.cloneState(App.defaultState);
    function initializeState() {
        if (App.DOM && App.Elements) {
            return;
        }
        const canvasNode = document.getElementById('myChart');
        if (!(canvasNode instanceof HTMLCanvasElement)) {
            throw new Error('无法找到有效的 Canvas 元素 (myChart)');
        }
        const svgNode = document.getElementById('d3Chart');
        if (!(svgNode instanceof SVGSVGElement)) {
            throw new Error('无法找到有效的 SVG 元素 (d3Chart)');
        }
        App.Elements = {
            canvas: canvasNode,
            ctx: canvasNode.getContext('2d'),
            svg: svgNode
        };
        App.DOM = {
            chartType: document.getElementById('chart-type'),
            chartTitle: document.getElementById('chart-title'),
            orientationVertical: document.getElementById('orientation-vertical'),
            orientationHorizontal: document.getElementById('orientation-horizontal'),
            labelsInput: document.getElementById('labels-input'),
            paletteSelect: document.getElementById('palette-select'),
            exportBg: document.getElementById('export-bg'),
            datasetContainer: document.getElementById('dataset-container'),
            addDataset: document.getElementById('add-dataset'),
            removeDataset: document.getElementById('remove-dataset'),
            themeLight: document.getElementById('theme-light'),
            themeDark: document.getElementById('theme-dark'),
            axisSwapBtn: document.getElementById('axis-swap-btn'),
            xAxisTitle: document.getElementById('x-axis-title'),
            yAxisLeftTitle: document.getElementById('y-axis-left-title'),
            yAxisRightTitle: document.getElementById('y-axis-right-title'),
            donutCutout: document.getElementById('donut-cutout'),
            donutCutoutValue: document.getElementById('donut-cutout-value'),
            pieRadius: document.getElementById('pie-radius'),
            pieRadiusValue: document.getElementById('pie-radius-value'),
            areaOpacity: document.getElementById('area-opacity'),
            areaOpacityValue: document.getElementById('area-opacity-value'),
            histBins: document.getElementById('hist-bins'),
            histBinsValue: document.getElementById('hist-bins-value'),
            bubbleUseCustomXY: document.getElementById('bubble-use-custom-xy'),
            bubbleXData: document.getElementById('bubble-x-data'),
            bubbleYData: document.getElementById('bubble-y-data'),
            exportScale: document.getElementById('export-scale'),
            exportScaleValue: document.getElementById('export-scale-value'),
            exportType: document.getElementById('export-type'),
            exportButton: document.getElementById('export-image'),
            resetDashboard: document.getElementById('reset-dashboard')
        };
    }
    App.initializeState = initializeState;
})(App || (App = {}));
/// <reference path="../app.types.ts" />
var App;
(function (App) {
    var Utils;
    (function (Utils) {
        var Color;
        (function (Color) {
            function normalizeColorToHex(color) {
                try {
                    if (!color || typeof color !== 'string')
                        return '#FFFFFF';
                    if (color.startsWith('#'))
                        return color.toUpperCase();
                    const match = color.match(/rgba?\(([^)]+)\)/);
                    if (match) {
                        const parts = match[1].split(',').map(part => parseFloat(part.trim()));
                        const [r, g, b] = parts;
                        if (!Number.isFinite(r) || !Number.isFinite(g) || !Number.isFinite(b)) {
                            return '#FFFFFF';
                        }
                        const toHex = (value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, '0');
                        return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
                    }
                    return color;
                }
                catch (error) {
                    console.error('颜色转换失败:', error);
                    return '#FFFFFF';
                }
            }
            Color.normalizeColorToHex = normalizeColorToHex;
            function hexToRgba(hex, alpha) {
                try {
                    if (!hex || typeof hex !== 'string')
                        return `rgba(255,255,255,${alpha})`;
                    if (hex.startsWith('rgba'))
                        return adjustRgbaAlpha(hex, alpha);
                    const cleaned = hex.replace('#', '');
                    const bigint = parseInt(cleaned, 16);
                    if (isNaN(bigint))
                        return `rgba(255,255,255,${alpha})`;
                    const r = (bigint >> 16) & 255;
                    const g = (bigint >> 8) & 255;
                    const b = bigint & 255;
                    return `rgba(${r},${g},${b},${alpha})`;
                }
                catch (error) {
                    console.error('Hex转RGBA失败:', error);
                    return `rgba(255,255,255,${alpha})`;
                }
            }
            Color.hexToRgba = hexToRgba;
            function adjustRgbaAlpha(rgba, alpha) {
                try {
                    const match = rgba.match(/rgba?\(([^)]+)\)/);
                    if (!match)
                        return rgba;
                    const parts = match[1].split(',').map(p => p.trim());
                    const [r, g, b] = parts;
                    return `rgba(${r},${g},${b},${alpha})`;
                }
                catch (error) {
                    console.error('调整RGBA透明度失败:', error);
                    return rgba;
                }
            }
            Color.adjustRgbaAlpha = adjustRgbaAlpha;
            function ensureSolidColor(color, defaultAlpha = 1) {
                try {
                    if (!color || typeof color !== 'string')
                        return `rgba(255,255,255,${defaultAlpha})`;
                    if (color.startsWith('rgba'))
                        return adjustRgbaAlpha(color, defaultAlpha);
                    if (color.startsWith('#'))
                        return hexToRgba(color, defaultAlpha);
                    return color;
                }
                catch (error) {
                    console.error('确保实色失败:', error);
                    return `rgba(255,255,255,${defaultAlpha})`;
                }
            }
            Color.ensureSolidColor = ensureSolidColor;
            function rgbaToHex(rgba) {
                try {
                    if (!rgba || typeof rgba !== 'string')
                        return '#FFFFFF';
                    if (rgba.startsWith('#'))
                        return rgba.toUpperCase();
                    const match = rgba.match(/rgba?\(([^)]+)\)/);
                    if (!match)
                        return '#FFFFFF';
                    const parts = match[1].split(',').map(p => parseFloat(p.trim()));
                    const [r, g, b] = parts;
                    if (!Number.isFinite(r) || !Number.isFinite(g) || !Number.isFinite(b)) {
                        return '#FFFFFF';
                    }
                    const toHex = (value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, '0');
                    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
                }
                catch (error) {
                    console.error('RGBA转Hex失败:', error);
                    return '#FFFFFF';
                }
            }
            Color.rgbaToHex = rgbaToHex;
            function adjustPalette(palette, alpha) {
                try {
                    if (!Array.isArray(palette))
                        return [];
                    return palette.map(color => hexToRgba(color, alpha));
                }
                catch (error) {
                    console.error('调整调色板失败:', error);
                    return palette || [];
                }
            }
            Color.adjustPalette = adjustPalette;
        })(Color = Utils.Color || (Utils.Color = {}));
    })(Utils = App.Utils || (App.Utils = {}));
})(App || (App = {}));
/// <reference path="../app.types.ts" />
var App;
(function (App) {
    var Utils;
    (function (Utils) {
        var Data;
        (function (Data) {
            function parseCSVNumbers(csv, maxLength = 1000) {
                try {
                    if (!csv || typeof csv !== 'string')
                        return [];
                    const items = csv.split(',').slice(0, maxLength);
                    return items
                        .map(item => parseFloat(item.trim()))
                        .filter(num => Number.isFinite(num));
                }
                catch (error) {
                    console.error('解析CSV数字失败:', error);
                    return [];
                }
            }
            Data.parseCSVNumbers = parseCSVNumbers;
            function formatNumber(n) {
                try {
                    if (!Number.isFinite(n))
                        return '0';
                    if (Math.abs(n) >= 1000 || Math.abs(n) < 0.01) {
                        return n.toExponential(2);
                    }
                    return Number(n.toFixed(2));
                }
                catch (error) {
                    console.error('格式化数字失败:', error);
                    return '0';
                }
            }
            Data.formatNumber = formatNumber;
            function computeHistogram(values, binsCount) {
                try {
                    if (!Array.isArray(values) || values.length === 0) {
                        return { binLabels: ['0-0'], binValues: [0] };
                    }
                    const arr = values.map(v => Number(v) || 0);
                    const min = Math.min(...arr);
                    const max = Math.max(...arr);
                    if (!Number.isFinite(min) || !Number.isFinite(max)) {
                        return { binLabels: ['0-0'], binValues: [0] };
                    }
                    const bins = Math.max(1, Math.min(100, binsCount || 10));
                    const step = (max - min) / bins || 1;
                    const counts = new Array(bins).fill(0);
                    arr.forEach(v => {
                        let idx = Math.floor((v - min) / step);
                        if (idx >= bins)
                            idx = bins - 1;
                        if (idx < 0)
                            idx = 0;
                        counts[idx]++;
                    });
                    const labels = counts.map((_, i) => {
                        const a = min + i * step;
                        const b = min + (i + 1) * step;
                        return `${formatNumber(a)}-${formatNumber(b)}`;
                    });
                    return { binLabels: labels, binValues: counts };
                }
                catch (error) {
                    console.error('计算直方图失败:', error);
                    return { binLabels: ['0-0'], binValues: [0] };
                }
            }
            Data.computeHistogram = computeHistogram;
            function parseDatasetValues(raw, length) {
                try {
                    const values = parseCSVNumbers(raw);
                    if (values.length >= length) {
                        return values.slice(0, length);
                    }
                    const padded = [...values];
                    while (padded.length < length) {
                        padded.push(0);
                    }
                    return padded;
                }
                catch (error) {
                    console.error('解析数据集值失败:', error);
                    return new Array(Math.max(0, length || 0)).fill(0);
                }
            }
            Data.parseDatasetValues = parseDatasetValues;
        })(Data = Utils.Data || (Utils.Data = {}));
    })(Utils = App.Utils || (App.Utils = {}));
})(App || (App = {}));
/// <reference path="../app.types.ts" />
/// <reference path="../app.state.ts" />
var App;
(function (App) {
    var Utils;
    (function (Utils) {
        var DOM;
        (function (DOM) {
            function getCanvasBackgroundColor() {
                const style = getComputedStyle(document.documentElement);
                const chartBg = style.getPropertyValue('--chart-bg').trim();
                if (chartBg)
                    return chartBg;
                const chartWrap = document.querySelector('.chart-wrap');
                if (chartWrap) {
                    return getComputedStyle(chartWrap).backgroundColor;
                }
                return '#FFFFFF';
            }
            DOM.getCanvasBackgroundColor = getCanvasBackgroundColor;
            function prepareSVG(svg, canvas) {
                while (svg.firstChild) {
                    svg.removeChild(svg.firstChild);
                }
                svg.classList.remove('hidden');
                canvas.classList.add('hidden');
                svg.style.display = '';
                svg.style.visibility = '';
                svg.style.opacity = '';
                canvas.style.display = '';
                canvas.style.visibility = '';
                canvas.style.opacity = '';
            }
            DOM.prepareSVG = prepareSVG;
            function prepareCanvas(svg, canvas) {
                svg.classList.add('hidden');
                canvas.classList.remove('hidden');
                svg.style.display = '';
                svg.style.visibility = '';
                svg.style.opacity = '';
                canvas.style.display = '';
                canvas.style.visibility = '';
                canvas.style.opacity = '';
            }
            DOM.prepareCanvas = prepareCanvas;
            function sizeSVG(svg) {
                const rect = svg.getBoundingClientRect();
                const width = rect.width || svg.clientWidth || 800;
                const height = rect.height || svg.clientHeight || 400;
                svg.setAttribute('width', String(width));
                svg.setAttribute('height', String(height));
                return { width, height };
            }
            DOM.sizeSVG = sizeSVG;
            function addSVGTitles(svg, title, width, height) {
                const existingTitle = svg.querySelector('title');
                if (existingTitle) {
                    existingTitle.textContent = title;
                }
                else {
                    const titleEl = document.createElementNS('http://www.w3.org/2000/svg', 'title');
                    titleEl.textContent = title;
                    svg.insertBefore(titleEl, svg.firstChild);
                }
                const metaId = 'chart-meta-info';
                let metaGroup = svg.querySelector(`#${metaId}`);
                if (!metaGroup) {
                    metaGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                    metaGroup.setAttribute('id', metaId);
                    svg.appendChild(metaGroup);
                }
                metaGroup.innerHTML = '';
                const titleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                titleText.textContent = title;
                titleText.setAttribute('x', String(width / 2));
                titleText.setAttribute('y', '28');
                titleText.setAttribute('fill', App.Theme.getThemeTextColor());
                titleText.setAttribute('font-size', '18');
                titleText.setAttribute('font-weight', '600');
                titleText.setAttribute('text-anchor', 'middle');
                metaGroup.appendChild(titleText);
                // 原版不会追加导出时间戳，这里保持标题即可
            }
            DOM.addSVGTitles = addSVGTitles;
        })(DOM = Utils.DOM || (Utils.DOM = {}));
    })(Utils = App.Utils || (App.Utils = {}));
})(App || (App = {}));
/// <reference path="../app.state.ts" />
/// <reference path="./color.ts" />
/// <reference path="./dom.ts" />
var App;
(function (App) {
    var Utils;
    (function (Utils) {
        var Helpers;
        (function (Helpers) {
            function debounce(fn, delay) {
                let timer = null;
                return function (...args) {
                    if (timer)
                        clearTimeout(timer);
                    timer = setTimeout(() => fn.apply(this, args), delay);
                };
            }
            Helpers.debounce = debounce;
            function showSuccessFeedback(element, duration = 600) {
                if (!element)
                    return;
                element.classList.add('success');
                setTimeout(() => element.classList.remove('success'), duration);
            }
            Helpers.showSuccessFeedback = showSuccessFeedback;
            function triggerDownload(url, filename) {
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            Helpers.triggerDownload = triggerDownload;
            function unwrap(value, message) {
                if (value === null || value === undefined) {
                    throw new Error(message);
                }
                return value;
            }
            Helpers.unwrap = unwrap;
        })(Helpers = Utils.Helpers || (Utils.Helpers = {}));
    })(Utils = App.Utils || (App.Utils = {}));
})(App || (App = {}));
(function (App) {
    App.Theme = {
        isDarkTheme() {
            return document.documentElement.getAttribute('data-theme') === 'dark';
        },
        getThemeTextColor() {
            return this.isDarkTheme() ? '#E8E8EA' : '#1f1a10';
        },
        getThemeGridColor() {
            return this.isDarkTheme() ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
        }
    };
})(App || (App = {}));
function createPieExternalLabelsPlugin(isDarkTheme) {
    return {
        id: 'pieExternalLabels',
        afterDatasetsDraw(chart) {
            const ctx = chart.ctx;
            const meta = chart.getDatasetMeta(0);
            if (!meta || meta.hidden)
                return;
            const dataset = chart.data.datasets[0];
            const labels = chart.data.labels || [];
            const total = dataset.data.reduce((sum, value) => sum + value, 0);
            // 使用与标题一致的主题颜色
            const textColor = App.Theme.getThemeTextColor();
            const lineColor = isDarkTheme ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';
            const left = [];
            const right = [];
            dataset.data.forEach((value, index) => {
                const arc = meta.data[index];
                if (!arc || !value)
                    return;
                const percent = value / total;
                if (!isFinite(percent) || percent <= 0.0005)
                    return;
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
            const adjust = (items, direction) => {
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
                const lines = [
                    { text: item.label ?? '', font: '600 15px "Inter", sans-serif' },
                    { text: item.percentText ?? '', font: '600 13px "Inter", sans-serif' }
                ];
                if (item.valueText) {
                    lines.push({ text: item.valueText, font: '12px "Inter", sans-serif' });
                }
                let maxWidth = 0;
                lines.forEach(line => {
                    if (!line.text)
                        return;
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
var App;
(function (App) {
    var Renderers;
    (function (Renderers) {
        var ChartJS;
        (function (ChartJS) {
            function setChartInstance(instance) {
                App.myChart = instance;
            }
            ChartJS.setChartInstance = setChartInstance;
            const { COLOR_PALETTES } = App;
            function applyPalette(key) {
                const scheme = COLOR_PALETTES[key] || COLOR_PALETTES.bright;
                App.initialData.datasets.forEach((ds, i) => {
                    const color = scheme[i % scheme.length];
                    ds.backgroundColor = App.Utils.Color.hexToRgba(color, 0.7);
                    ds.borderColor = App.Utils.Color.hexToRgba(color, 1);
                });
                App.currentPaletteKey = key;
            }
            ChartJS.applyPalette = applyPalette;
            function buildOptions(textColor, gridColor, hasRightAxis, chartType) {
                const titleText = chartType ? getChartTitleWithSeries(chartType) : App.DOM.chartTitle.value;
                const isDarkTheme = App.Theme.isDarkTheme();
                const isAreaChart = chartType === 'area' || chartType === 'area-stacked';
                const options = {
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
            function buildDatasets() {
                return App.initialData.datasets
                    .filter(ds => ds.visible !== false)
                    .map(ds => {
                    const base = {
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
            function buildPiePalette() {
                return COLOR_PALETTES[App.currentPaletteKey] || COLOR_PALETTES.bright;
            }
            function getSelectedSeriesInfo() {
                const singleSeriesSelect = document.getElementById('single-series-select');
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
            function getChartTitleWithSeries(chartType) {
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
            function renderChart() {
                const chartType = App.DOM.chartType.value;
                const backgroundColor = App.Utils.Color.normalizeColorToHex(App.DOM.exportBg.value);
                const canvas = document.getElementById('myChart');
                const svg = document.getElementById('d3Chart');
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
                    const singleSeriesSelect = document.getElementById('single-series-select');
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
                        const singleSeriesSelect = document.getElementById('single-series-select');
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
                            }
                            else if (bins > 8) {
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
                        }
                        else {
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
                            }
                            else if (mixedType === 'line') {
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
                        const pieSeriesSelect = document.getElementById('single-series-select');
                        let pieSelectedIndex = 0;
                        if (pieSeriesSelect && !pieSeriesSelect.disabled) {
                            pieSelectedIndex = parseInt(pieSeriesSelect.value || '0', 10);
                        }
                        const pieDataset = App.initialData.datasets[pieSelectedIndex];
                        if (pieDataset) {
                            datasets = [{
                                    label: pieDataset.label,
                                    data: [...pieDataset.data],
                                    backgroundColor: palette.map(color => App.Utils.Color.hexToRgba(color, 1.0)), // 使用完全不透明，避免渲染问题
                                    borderColor: '#fff',
                                    borderWidth: 3 // 增加边框宽度，让间隙更明显
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
                                            callback: (value) => `${value}`,
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
                                    afterDatasetsDraw(chart) {
                                        const chartCtx = chart.ctx;
                                        const scale = chart.scales.r;
                                        const labels = chart.data.labels;
                                        const scaleMax = typeof scale.max === 'number' ? scale.max : 20;
                                        // 动态计算刻度值
                                        let tickValues = [];
                                        if (scaleMax <= 5) {
                                            // 小数据: [1, 2, 3, 4, 5]
                                            tickValues = [1, 2, 3, 4, 5].filter(v => v <= scaleMax);
                                        }
                                        else if (scaleMax <= 10) {
                                            // 中小数据: [2, 4, 6, 8, 10]
                                            tickValues = [2, 4, 6, 8, 10].filter(v => v <= scaleMax);
                                        }
                                        else if (scaleMax <= 20) {
                                            // 中等数据: [4, 8, 12, 16, 20]
                                            tickValues = [4, 8, 12, 16, 20].filter(v => v <= scaleMax);
                                        }
                                        else if (scaleMax <= 50) {
                                            // 中大数据: [10, 20, 30, 40, 50]
                                            tickValues = [10, 20, 30, 40, 50].filter(v => v <= scaleMax);
                                        }
                                        else if (scaleMax <= 100) {
                                            // 大数据: [20, 40, 60, 80, 100]
                                            tickValues = [20, 40, 60, 80, 100].filter(v => v <= scaleMax);
                                        }
                                        else {
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
                                        labels.forEach((label, index) => {
                                            const angleInRadians = scale.getIndexAngle(index) - Math.PI / 2;
                                            tickValues.forEach((rawValue) => {
                                                if (!Number.isFinite(rawValue) || rawValue <= 0)
                                                    return;
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
                        }
                        else {
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
                                        fill: true, // 使用 true 而不是 'origin'，避免复杂的自交问题
                                        tension: 0.35, // 与原网页一致
                                        borderWidth: typeof rest.borderWidth === 'number' ? rest.borderWidth : 2,
                                        pointRadius: typeof rest.pointRadius === 'number' ? rest.pointRadius : 4,
                                        pointHoverRadius: typeof rest.pointHoverRadius === 'number' ? rest.pointHoverRadius : 6,
                                        backgroundColor: fillColor,
                                        borderColor: borderColor,
                                        pointBackgroundColor: borderColor,
                                        pointBorderColor: borderColor
                                    };
                                });
                            }
                            else if (isAreaStackedChart) {
                                // 堆积面积图：使用简单的 fill: true 配置
                                const stackId = 'area-stack';
                                datasets = datasets.map((ds, index) => {
                                    const { type, ...rest } = ds;
                                    const borderColor = rest.borderColor || rest.backgroundColor;
                                    const fillColor = App.Utils.Color.adjustRgbaAlpha(borderColor, opacity);
                                    return {
                                        ...rest,
                                        stack: stackId,
                                        fill: true, // 让 Chart.js 自动处理堆积填充
                                        tension: 0.35, // 与原网页一致
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
                            }
                            else {
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
                        let customXValues = [];
                        let customYValues = [];
                        if (useCustomXY && App.DOM.bubbleXData && App.DOM.bubbleYData) {
                            customXValues = App.Utils.Data.parseCSVNumbers(App.DOM.bubbleXData.value);
                            customYValues = App.Utils.Data.parseCSVNumbers(App.DOM.bubbleYData.value);
                        }
                        const allDataValues = [];
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
                                let xValue;
                                let yValue;
                                if (useCustomXY && customXValues.length > pointIndex && customYValues.length > pointIndex) {
                                    // 使用用户提供的真实XY坐标
                                    xValue = customXValues[pointIndex];
                                    yValue = customYValues[pointIndex];
                                }
                                else {
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
                                    label: function (context) {
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
                                        }
                                        else {
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
                const customPlugins = [];
                if (options.plugins?.pieExternalLabels) {
                    customPlugins.push(options.plugins.pieExternalLabels);
                }
                if (options.plugins?.radarAxisLabels) {
                    customPlugins.push(options.plugins.radarAxisLabels);
                }
                const config = {
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
                        }
                        else {
                            App.myChart.update('none'); // 跳过动画，性能更好
                        }
                    }
                    else {
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
                }
                catch (error) {
                    console.error('图表渲染失败:', error);
                    // 发生错误时强制重新创建
                    if (App.myChart) {
                        try {
                            App.myChart.destroy();
                        }
                        catch (e) {
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
            ChartJS.renderChart = renderChart;
        })(ChartJS = Renderers.ChartJS || (Renderers.ChartJS = {}));
    })(Renderers = App.Renderers || (App.Renderers = {}));
})(App || (App = {}));
/// <reference path="../app.types.ts" />
/// <reference path="../app.constants.ts" />
/// <reference path="../app.state.ts" />
/// <reference path="../utils/color.ts" />
/// <reference path="../utils/data.ts" />
/// <reference path="../utils/dom.ts" />
/// <reference path="../utils/helpers.ts" />
var App;
(function (App) {
    var Renderers;
    (function (Renderers) {
        var D3;
        (function (D3) {
            const { COLOR_PALETTES, CHART_CONSTANTS } = App;
            function ensureD3() {
                if (typeof d3 === 'undefined') {
                    throw new Error('D3.js 未加载');
                }
                return d3;
            }
            function getSelectedSeriesLabel() {
                const singleSeriesSelect = document.getElementById('single-series-select');
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
            function getTitleWithSeries() {
                const baseTitle = App.DOM.chartTitle.value || '我的图表';
                const seriesLabel = getSelectedSeriesLabel();
                if (seriesLabel) {
                    return `${baseTitle} - ${seriesLabel}`;
                }
                return baseTitle;
            }
            function createStack(instance, layers) {
                const stackFactory = instance.stack;
                const stack = stackFactory();
                stack.keys(instance.range(layers));
                stack.offset(instance.stackOffsetWiggle);
                stack.order(instance.stackOrderInsideOut);
                return stack;
            }
            function renderStreamgraph() {
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
                        const entry = {};
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
                    const yExtent = [
                        d3Instance.min(series, s => d3Instance.min(s, d => d[0])) ?? 0,
                        d3Instance.max(series, s => d3Instance.max(s, d => d[1])) ?? 0
                    ];
                    const y = d3Instance.scaleLinear()
                        .domain(yExtent)
                        .nice()
                        .range([chartHeight, 0]);
                    const colorByKey = new Map();
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
                        .attr('d', d => area(d))
                        .attr('fill', (_, index) => colorByKey.get(keys[index]) || App.Utils.Color.hexToRgba('#4ECDC4', 1.0))
                        .attr('opacity', CHART_CONSTANTS.D3.STREAMGRAPH_OPACITY)
                        .attr('stroke', '#fff')
                        .attr('stroke-width', 0.5);
                    const axis = d3Instance.axisBottom(x).tickSize(0).tickPadding(12);
                    const axisElement = root.append('g')
                        .attr('transform', `translate(0,${chartHeight})`)
                        .call(axis);
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
                }
                catch (error) {
                    console.error('渲染流图失败:', error);
                    const svg = App.Elements.svg;
                    if (svg) {
                        App.Utils.DOM.prepareSVG(svg, App.Elements.canvas);
                        const { width, height } = App.Utils.DOM.sizeSVG(svg);
                        App.Utils.DOM.addSVGTitles(svg, '渲染错误', width, height);
                    }
                }
            }
            D3.renderStreamgraph = renderStreamgraph;
            function renderTreemap() {
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
                        const singleSeriesSelect = document.getElementById('single-series-select');
                        if (singleSeriesSelect && !singleSeriesSelect.disabled) {
                            const idx = parseInt(singleSeriesSelect.value || '0', 10);
                            if (!Number.isNaN(idx) && App.initialData.datasets[idx]) {
                                return idx;
                            }
                        }
                        return 0;
                    })();
                    const selectedDataset = App.initialData.datasets[selectedIndex];
                    if (!selectedDataset)
                        return;
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
                    const color = d3Instance.scaleLinear()
                        .domain([0, d3Instance.max(validValues) || 1])
                        .range([d3Instance.color(baseHex).brighter(1.5), d3Instance.color(baseHex).darker(0.5)]);
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
                }
                catch (error) {
                    console.error('渲染树图失败:', error);
                    const svg = App.Elements.svg;
                    if (svg) {
                        App.Utils.DOM.prepareSVG(svg, App.Elements.canvas);
                        const { width, height } = App.Utils.DOM.sizeSVG(svg);
                        App.Utils.DOM.addSVGTitles(svg, '渲染错误', width, height);
                    }
                }
            }
            D3.renderTreemap = renderTreemap;
        })(D3 = Renderers.D3 || (Renderers.D3 = {}));
    })(Renderers = App.Renderers || (App.Renderers = {}));
})(App || (App = {}));
/// <reference path="../app.types.ts" />
/// <reference path="../app.constants.ts" />
/// <reference path="../app.state.ts" />
/// <reference path="../utils/helpers.ts" />
var App;
(function (App) {
    var UI;
    (function (UI) {
        var Visibility;
        (function (Visibility) {
            function refreshSingleSeriesOptions() {
                const select = document.getElementById('single-series-select');
                if (!select)
                    return;
                const fragment = document.createDocumentFragment();
                App.initialData.datasets.forEach((dataset, index) => {
                    const option = document.createElement('option');
                    option.value = String(index);
                    option.textContent = dataset.label || `对比量 ${index + 1}`;
                    fragment.appendChild(option);
                });
                select.innerHTML = '';
                select.appendChild(fragment);
                select.disabled = App.initialData.datasets.length === 0;
            }
            Visibility.refreshSingleSeriesOptions = refreshSingleSeriesOptions;
            function updateControlVisibility(chartType) {
                const singleWrap = document.getElementById('single-series-wrap');
                const donutWrap = document.getElementById('donut-wrap');
                const pieSizeWrap = document.getElementById('pie-radius-wrap') || document.getElementById('pie-size-wrap');
                const areaWrap = document.getElementById('area-opacity-wrap');
                const histWrap = document.getElementById('hist-wrap');
                const mixedWrap = document.getElementById('mixed-types-group');
                const bubbleWrap = document.getElementById('bubble-data-wrap');
                const showSingle = ['pie', 'donut', 'histogram', 'treemap'].includes(chartType);
                const showDonut = chartType === 'donut';
                const showPieSize = chartType === 'pie' || chartType === 'donut';
                const showArea = chartType === 'area' || chartType === 'area-stacked' || chartType === 'radar';
                const showHist = chartType === 'histogram';
                const showMixed = chartType === 'bar-line';
                const showBubble = chartType === 'bubble';
                toggle(singleWrap, showSingle);
                toggle(donutWrap, showDonut);
                toggle(pieSizeWrap, showPieSize);
                toggle(areaWrap, showArea);
                toggle(histWrap, showHist);
                toggle(mixedWrap, showMixed);
                toggle(bubbleWrap, showBubble);
                if (showMixed) {
                    App.UI.Controls.buildMixedTypeSelectors();
                }
                else {
                    const mixedContainer = document.getElementById('mixed-types-container');
                    if (mixedContainer) {
                        mixedContainer.innerHTML = '';
                    }
                }
            }
            Visibility.updateControlVisibility = updateControlVisibility;
            function updateSeriesNote(seriesName) {
                const note = document.getElementById('chart-selected-label');
                if (!note)
                    return;
                if (seriesName) {
                    note.textContent = `当前系列：${seriesName}`;
                    note.classList.remove('hidden');
                }
                else {
                    note.textContent = '';
                    note.classList.add('hidden');
                }
            }
            Visibility.updateSeriesNote = updateSeriesNote;
            function toggle(element, visible) {
                if (!element)
                    return;
                element.classList.toggle('hidden', !visible);
            }
        })(Visibility = UI.Visibility || (UI.Visibility = {}));
    })(UI = App.UI || (App.UI = {}));
})(App || (App = {}));
/// <reference path="../app.types.ts" />
/// <reference path="../app.state.ts" />
/// <reference path="../utils/color.ts" />
/// <reference path="../utils/data.ts" />
/// <reference path="./visibility.ts" />
var App;
(function (App) {
    var UI;
    (function (UI) {
        var Controls;
        (function (Controls) {
            Controls.__isRebuildingMixedSelectors = false;
            function createDatasetControls() {
                const container = document.getElementById('dataset-container');
                if (!container)
                    return;
                const fragment = document.createDocumentFragment();
                App.initialData.datasets.forEach((dataset, index) => {
                    const item = document.createElement('div');
                    item.className = 'dataset-item';
                    const colorHex = App.Utils.Color.rgbaToHex(dataset.backgroundColor) || '#FF6B6B';
                    const dataStr = (dataset.data || []).join(', ');
                    item.innerHTML = `
                <div class="control-group dataset-header">
                    <label for="dataset-name-${index}">名称</label>
                    <div class="inline-row dataset-name-row">
                        <input type="text" id="dataset-name-${index}" value="${dataset.label}">
                    </div>
                    <div class="inline-row dataset-switch-row">
                        <div class="right-axis-control">
                            <label class="switch">
                                <input type="checkbox" id="dataset-right-${index}" ${dataset.yAxisID === 'y1' ? 'checked' : ''}>
                                <span class="slider"></span>
                            </label>
                            <span class="switch-label">绑定右轴</span>
                        </div>
                        <div class="visibility-control">
                            <label class="switch">
                                <input type="checkbox" id="dataset-visible-${index}" ${dataset.visible !== false ? 'checked' : ''}>
                                <span class="slider"></span>
                            </label>
                            <span class="switch-label">显示</span>
                        </div>
                    </div>
                    <button class="inline-btn dataset-save" id="dataset-name-done-${index}">完成</button>
                </div>
                <div class="control-group color-input">
                    <input type="color" id="dataset-color-${index}" value="${colorHex}">
                </div>
                <div class="control-group">
                    <label for="dataset-data-${index}">数据（逗号分隔）</label>
                    <textarea id="dataset-data-${index}" rows="2">${dataStr}</textarea>
                </div>
            `;
                    fragment.appendChild(item);
                });
                container.innerHTML = '';
                container.appendChild(fragment);
            }
            Controls.createDatasetControls = createDatasetControls;
            function buildMixedTypeSelectors() {
                const container = document.getElementById('mixed-types-container');
                if (Controls.__isRebuildingMixedSelectors || !container) {
                    return;
                }
                Controls.__isRebuildingMixedSelectors = true;
                const fragment = document.createDocumentFragment();
                const visibleDatasets = App.initialData.datasets
                    .map((dataset, originalIndex) => ({ dataset, originalIndex }))
                    .filter(({ dataset }) => dataset.visible !== false);
                visibleDatasets.forEach(({ dataset, originalIndex }, index) => {
                    const row = document.createElement('div');
                    row.className = 'inline-row';
                    const header = document.createElement('div');
                    header.className = 'inline-row-header';
                    const labelSpan = document.createElement('span');
                    labelSpan.textContent = dataset.label || `对比量 ${index + 1}`;
                    header.appendChild(labelSpan);
                    const typeSelect = document.createElement('select');
                    typeSelect.id = `dataset-type-${originalIndex}`;
                    typeSelect.className = 'mixed-type-select';
                    ['bar', 'line'].forEach(value => {
                        const option = document.createElement('option');
                        option.value = value;
                        option.textContent = value === 'bar' ? '柱状' : '折线';
                        if ((dataset.type || 'bar') === value) {
                            option.selected = true;
                        }
                        typeSelect.appendChild(option);
                    });
                    typeSelect.addEventListener('change', (event) => {
                        const target = App.initialData.datasets[originalIndex];
                        if (!target)
                            return;
                        const value = event.target.value;
                        target.type = value;
                        if (value === 'bar') {
                            target.linePointStyle = undefined;
                            target.pointStyle = undefined;
                            target.lineBorderWidth = undefined;
                            target.pointRadius = undefined;
                            target.pointHoverRadius = undefined;
                        }
                        else {
                            if (!target.linePointStyle)
                                target.linePointStyle = 'circle';
                            if (!target.pointStyle)
                                target.pointStyle = target.linePointStyle;
                            if (typeof target.lineBorderWidth !== 'number')
                                target.lineBorderWidth = target.borderWidth || 2;
                            if (typeof target.pointRadius !== 'number')
                                target.pointRadius = 4;
                            if (typeof target.pointHoverRadius !== 'number')
                                target.pointHoverRadius = Math.min(target.pointRadius + 2, 12);
                        }
                        App.Renderers.ChartJS.renderChart();
                        setTimeout(() => App.UI.Controls.buildMixedTypeSelectors(), 0);
                    });
                    header.appendChild(typeSelect);
                    if ((dataset.type || 'bar') === 'line') {
                        const pointSelect = document.createElement('select');
                        pointSelect.className = 'point-style-select';
                        ['circle', 'rect', 'triangle', 'cross', 'star'].forEach(pointType => {
                            const option = document.createElement('option');
                            option.value = pointType;
                            option.textContent = pointType === 'circle' ? '●' :
                                pointType === 'rect' ? '■' :
                                    pointType === 'triangle' ? '▲' :
                                        pointType === 'cross' ? '✚' : '★';
                            if ((dataset.linePointStyle || dataset.pointStyle || 'circle') === pointType) {
                                option.selected = true;
                            }
                            pointSelect.appendChild(option);
                        });
                        pointSelect.addEventListener('change', (event) => {
                            const target = App.initialData.datasets[originalIndex];
                            if (!target)
                                return;
                            const value = event.target.value;
                            target.linePointStyle = value;
                            target.pointStyle = value;
                            target.pointBackgroundColor = target.borderColor;
                            target.pointBorderColor = target.borderColor;
                            App.Renderers.ChartJS.renderChart();
                        });
                        header.appendChild(pointSelect);
                        const dimensionGroup = document.createElement('div');
                        dimensionGroup.className = 'dimension-group';
                        const widthLabel = document.createElement('span');
                        widthLabel.textContent = '线宽:';
                        widthLabel.className = 'dimension-label';
                        const widthInput = document.createElement('input');
                        widthInput.type = 'number';
                        widthInput.min = '1';
                        widthInput.max = '12';
                        widthInput.step = '1';
                        widthInput.value = String(typeof dataset.lineBorderWidth === 'number' ? dataset.lineBorderWidth : (typeof dataset.borderWidth === 'number' ? dataset.borderWidth : 2));
                        widthInput.className = 'dimension-input';
                        widthInput.addEventListener('change', (event) => {
                            const target = App.initialData.datasets[originalIndex];
                            if (!target)
                                return;
                            let value = Number(event.target.value);
                            if (!Number.isFinite(value))
                                value = 2;
                            value = Math.min(10, Math.max(1, value));
                            target.lineBorderWidth = value;
                            target.borderWidth = value;
                            event.target.value = String(value);
                            App.Renderers.ChartJS.renderChart();
                        });
                        const radiusLabel = document.createElement('span');
                        radiusLabel.textContent = '点半径:';
                        radiusLabel.className = 'dimension-label';
                        const radiusInput = document.createElement('input');
                        radiusInput.type = 'number';
                        radiusInput.min = '1';
                        radiusInput.max = '12';
                        radiusInput.step = '1';
                        radiusInput.value = String(typeof dataset.pointRadius === 'number' ? dataset.pointRadius : 4);
                        radiusInput.className = 'dimension-input';
                        radiusInput.addEventListener('change', (event) => {
                            const target = App.initialData.datasets[originalIndex];
                            if (!target)
                                return;
                            let value = Number(event.target.value);
                            if (!Number.isFinite(value))
                                value = 4;
                            value = Math.min(12, Math.max(1, value));
                            target.pointRadius = value;
                            target.pointHoverRadius = Math.min(value + 2, 14);
                            event.target.value = String(value);
                            App.Renderers.ChartJS.renderChart();
                        });
                        dimensionGroup.append(widthLabel, widthInput, radiusLabel, radiusInput);
                        row.appendChild(dimensionGroup);
                    }
                    row.prepend(header);
                    fragment.appendChild(row);
                });
                container.innerHTML = '';
                container.appendChild(fragment);
                Controls.__isRebuildingMixedSelectors = false;
            }
            Controls.buildMixedTypeSelectors = buildMixedTypeSelectors;
        })(Controls = UI.Controls || (UI.Controls = {}));
    })(UI = App.UI || (App.UI = {}));
})(App || (App = {}));
/// <reference path="../app.state.ts" />
/// <reference path="../utils/color.ts" />
/// <reference path="../utils/dom.ts" />
/// <reference path="../renderers/chartjs.ts" />
var App;
(function (App) {
    var UI;
    (function (UI) {
        var Theme;
        (function (Theme) {
            function applyThemeBackground() {
                const defaultColor = App.Utils.Color.normalizeColorToHex(App.Utils.DOM.getCanvasBackgroundColor());
                App.DOM.exportBg.value = defaultColor;
            }
            Theme.applyThemeBackground = applyThemeBackground;
            function applyLightTheme() {
                document.documentElement.setAttribute('data-theme', 'light');
                App.DOM.themeLight.classList.add('active');
                App.DOM.themeDark.classList.remove('active');
                applyThemeBackground();
                App.Renderers.ChartJS.renderChart();
                setTimeout(() => {
                    document.body.classList.remove('theme-switching');
                }, 400);
            }
            Theme.applyLightTheme = applyLightTheme;
            function applyDarkTheme() {
                document.documentElement.setAttribute('data-theme', 'dark');
                App.DOM.themeDark.classList.add('active');
                App.DOM.themeLight.classList.remove('active');
                applyThemeBackground();
                App.Renderers.ChartJS.renderChart();
                setTimeout(() => {
                    document.body.classList.remove('theme-switching');
                }, 400);
            }
            Theme.applyDarkTheme = applyDarkTheme;
        })(Theme = UI.Theme || (UI.Theme = {}));
    })(UI = App.UI || (App.UI = {}));
})(App || (App = {}));
/// <reference path="../app.state.ts" />
/// <reference path="../app.constants.ts" />
/// <reference path="../utils/color.ts" />
/// <reference path="../utils/dom.ts" />
/// <reference path="../utils/helpers.ts" />
/// <reference path="../ui/controls.ts" />
/// <reference path="../ui/visibility.ts" />
/// <reference path="../renderers/chartjs.ts" />
/// <reference path="../ui/theme.ts" />
var App;
(function (App) {
    var State;
    (function (State) {
        function restoreDefaults() {
            const fresh = App.cloneState(App.defaultState);
            App.initialData.labels = fresh.labels;
            App.initialData.datasets.length = 0;
            fresh.datasets.forEach(ds => App.initialData.datasets.push(ds));
            App.DOM.chartType.value = 'bar';
            App.DOM.chartTitle.value = '我的图表';
            App.DOM.labelsInput.value = fresh.labels.join(', ');
            App.DOM.paletteSelect.value = 'bright';
            App.DOM.exportType.value = 'png';
            App.DOM.exportScale.value = '2';
            App.DOM.exportScaleValue.textContent = '2';
            App.DOM.exportBg.value = '#FFFFFF';
            App.DOM.xAxisTitle && (App.DOM.xAxisTitle.value = '');
            App.DOM.yAxisLeftTitle && (App.DOM.yAxisLeftTitle.value = '');
            App.DOM.yAxisRightTitle && (App.DOM.yAxisRightTitle.value = '');
            App.DOM.donutCutout.value = '50';
            App.DOM.donutCutoutValue.textContent = '50';
            App.DOM.pieRadius.value = '65';
            App.DOM.pieRadiusValue.textContent = '65';
            App.DOM.areaOpacity.value = '35';
            App.DOM.areaOpacityValue.textContent = '35';
            App.DOM.histBins.value = '10';
            App.DOM.histBinsValue.textContent = '10';
            App.DOM.orientationVertical.classList.add('active');
            App.DOM.orientationHorizontal.classList.remove('active');
            App.orientation = 'x';
            App.DOM.themeLight.classList.add('active');
            App.DOM.themeDark.classList.remove('active');
            document.documentElement.setAttribute('data-theme', 'light');
            App.currentPaletteKey = 'bright';
            App.Utils.DOM.prepareCanvas(App.Elements.svg, App.Elements.canvas);
            App.UI.Visibility.refreshSingleSeriesOptions();
            App.UI.Controls.createDatasetControls();
            App.UI.Visibility.updateControlVisibility('bar');
            App.Renderers.ChartJS.applyPalette(App.currentPaletteKey);
            App.Renderers.ChartJS.renderChart();
        }
        State.restoreDefaults = restoreDefaults;
    })(State = App.State || (App.State = {}));
})(App || (App = {}));
/// <reference path="../app.types.ts" />
/// <reference path="../app.constants.ts" />
/// <reference path="../app.state.ts" />
/// <reference path="../utils/color.ts" />
/// <reference path="../utils/dom.ts" />
/// <reference path="../utils/helpers.ts" />
/// <reference path="../renderers/d3.ts" />
var App;
(function (App) {
    var Export;
    (function (Export) {
        function exportCanvasToPNG(scale, bgColor) {
            if (!App.myChart) {
                alert('当前没有可导出的图表');
                return;
            }
            const sourceCanvas = App.myChart.canvas;
            const width = sourceCanvas.width;
            const height = sourceCanvas.height;
            const exportCanvas = document.createElement('canvas');
            exportCanvas.width = Math.max(1, Math.round(width * scale));
            exportCanvas.height = Math.max(1, Math.round(height * scale));
            const exportCtx = exportCanvas.getContext('2d');
            if (!exportCtx) {
                alert('导出失败：无法获取 Canvas 上下文');
                return;
            }
            exportCtx.fillStyle = bgColor;
            exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
            exportCtx.drawImage(sourceCanvas, 0, 0, exportCanvas.width, exportCanvas.height);
            const dataURL = exportCanvas.toDataURL('image/png');
            App.Utils.Helpers.triggerDownload(dataURL, `chart-${Date.now()}.png`);
        }
        function exportSVGToPNG(scale, bgColor) {
            const svgEl = App.Elements.svg;
            if (!svgEl || svgEl.classList.contains('hidden')) {
                alert('当前没有可导出的SVG图表');
                return;
            }
            try {
                const svgRect = svgEl.getBoundingClientRect();
                const width = svgRect.width;
                const height = svgRect.height;
                const canvas = document.createElement('canvas');
                canvas.width = Math.max(1, Math.round(width * scale));
                canvas.height = Math.max(1, Math.round(height * scale));
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    alert('导出失败：无法创建 Canvas 渲染上下文');
                    return;
                }
                ctx.fillStyle = bgColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                const serializer = new XMLSerializer();
                let svgStr = serializer.serializeToString(svgEl);
                const img = new Image();
                const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
                const url = URL.createObjectURL(svgBlob);
                img.onload = function () {
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    const dataURL = canvas.toDataURL('image/png');
                    App.Utils.Helpers.triggerDownload(dataURL, `chart-${Date.now()}.png`);
                    URL.revokeObjectURL(url);
                };
                img.onerror = function () {
                    alert('SVG转PNG失败，请尝试导出SVG格式');
                    URL.revokeObjectURL(url);
                };
                img.src = url;
            }
            catch (error) {
                console.error('SVG导出失败:', error);
                alert('SVG导出失败: ' + (error?.message || error));
            }
        }
        function exportSVGToFile() {
            const svgEl = App.Elements.svg;
            if (!svgEl || svgEl.classList.contains('hidden')) {
                alert('当前图表不支持SVG导出，请选择PNG格式');
                return;
            }
            const serializer = new XMLSerializer();
            let svgStr = serializer.serializeToString(svgEl);
            svgStr = '<?xml version="1.0" standalone="no"?>\r\n' + svgStr;
            const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            App.Utils.Helpers.triggerDownload(url, `chart-${Date.now()}.svg`);
            URL.revokeObjectURL(url);
        }
        function exportChartImage(type, scale, bgColor) {
            try {
                const normalizedScale = Number.isFinite(scale) ? Math.max(1, Math.min(10, scale)) : 1;
                const normalizedBg = App.Utils.Color.normalizeColorToHex(bgColor) || '#FFFFFF';
                const svgEl = document.getElementById('d3Chart');
                const isSVGChart = svgEl && !svgEl.classList.contains('hidden');
                if (type === 'svg') {
                    if (isSVGChart) {
                        exportSVGToFile();
                    }
                    else {
                        alert('当前图表不支持SVG导出，请选择PNG格式');
                    }
                }
                else {
                    if (isSVGChart) {
                        exportSVGToPNG(normalizedScale, normalizedBg);
                    }
                    else {
                        exportCanvasToPNG(normalizedScale, normalizedBg);
                    }
                }
            }
            catch (error) {
                console.error('导出失败:', error);
                alert('导出图片时出现错误，请稍后重试。');
            }
        }
        Export.exportChartImage = exportChartImage;
    })(Export = App.Export || (App.Export = {}));
})(App || (App = {}));
/// <reference path="../app.types.ts" />
/// <reference path="../app.state.ts" />
/// <reference path="../app.constants.ts" />
/// <reference path="../utils/helpers.ts" />
/// <reference path="../utils/color.ts" />
/// <reference path="../utils/data.ts" />
/// <reference path="../renderers/chartjs.ts" />
/// <reference path="./controls.ts" />
/// <reference path="./visibility.ts" />
var App;
(function (App) {
    var UI;
    (function (UI) {
        var Bindings;
        (function (Bindings) {
            const debounceFastRender = App.Utils.Helpers.debounce(App.Renderers.ChartJS.renderChart, 100);
            function bindDatasetContainer() {
                const container = App.DOM.datasetContainer;
                if (!container)
                    return;
                container.addEventListener('click', (e) => {
                    const target = e.target;
                    if (target && target.matches('[id^="dataset-name-done-"]')) {
                        const index = parseInt(target.id.replace('dataset-name-done-', ''), 10);
                        const nameInput = document.getElementById(`dataset-name-${index}`);
                        if (nameInput && App.initialData.datasets[index]) {
                            App.initialData.datasets[index].label = nameInput.value;
                            App.UI.Visibility.refreshSingleSeriesOptions();
                            App.Renderers.ChartJS.renderChart();
                            App.Utils.Helpers.showSuccessFeedback(target);
                        }
                    }
                });
                container.addEventListener('input', (e) => {
                    const target = e.target;
                    if (target && target.matches('[id^="dataset-color-"]')) {
                        const index = parseInt(target.id.replace('dataset-color-', ''), 10);
                        if (App.initialData.datasets[index]) {
                            App.initialData.datasets[index].backgroundColor = App.Utils.Color.hexToRgba(target.value, 0.7);
                            App.initialData.datasets[index].borderColor = App.Utils.Color.hexToRgba(target.value, 1);
                            debounceFastRender();
                        }
                    }
                });
                container.addEventListener('change', (e) => {
                    const target = e.target;
                    if (target && target.matches('[id^="dataset-right-"]')) {
                        const index = parseInt(target.id.replace('dataset-right-', ''), 10);
                        if (App.initialData.datasets[index]) {
                            App.initialData.datasets[index].yAxisID = target.checked ? 'y1' : 'y';
                            App.Renderers.ChartJS.renderChart();
                        }
                    }
                    else if (target && target.matches('[id^="dataset-visible-"]')) {
                        const index = parseInt(target.id.replace('dataset-visible-', ''), 10);
                        if (App.initialData.datasets[index]) {
                            App.initialData.datasets[index].visible = target.checked;
                            App.UI.Visibility.refreshSingleSeriesOptions();
                            App.Renderers.ChartJS.renderChart();
                        }
                    }
                });
                container.addEventListener('blur', (e) => {
                    const target = e.target;
                    if (target && target.matches('[id^="dataset-data-"]')) {
                        const index = parseInt(target.id.replace('dataset-data-', ''), 10);
                        if (App.initialData.datasets[index]) {
                            const parsed = App.Utils.Data.parseDatasetValues(target.value, App.initialData.labels.length);
                            App.initialData.datasets[index].data = parsed;
                            debounceFastRender();
                        }
                    }
                    if (target && target.matches('[id^="dataset-name-"]')) {
                        const index = parseInt(target.id.replace('dataset-name-', ''), 10);
                        if (App.initialData.datasets[index]) {
                            App.initialData.datasets[index].label = target.value;
                            App.UI.Visibility.refreshSingleSeriesOptions();
                            App.Renderers.ChartJS.renderChart();
                        }
                    }
                }, true);
            }
            Bindings.bindDatasetContainer = bindDatasetContainer;
            function bindGlobalControls() {
                if (App.DOM.labelsInput) {
                    App.DOM.labelsInput.addEventListener('blur', () => {
                        const labels = App.DOM.labelsInput.value
                            .split(/[,，]/)
                            .map(s => s.trim())
                            .filter(s => s.length > 0);
                        if (labels.length > 0) {
                            App.initialData.labels = labels;
                            App.Renderers.ChartJS.renderChart();
                        }
                    });
                }
                const singleSeriesSelect = document.getElementById('single-series-select');
                if (singleSeriesSelect) {
                    singleSeriesSelect.addEventListener('change', App.Renderers.ChartJS.renderChart);
                }
                App.DOM.xAxisTitle?.addEventListener('blur', App.Renderers.ChartJS.renderChart);
                App.DOM.yAxisLeftTitle?.addEventListener('blur', App.Renderers.ChartJS.renderChart);
                App.DOM.yAxisRightTitle?.addEventListener('blur', App.Renderers.ChartJS.renderChart);
                if (App.DOM.donutCutout && App.DOM.donutCutoutValue) {
                    App.DOM.donutCutout.addEventListener('input', (e) => {
                        const target = e.target;
                        const value = target.value;
                        App.DOM.donutCutoutValue.textContent = value;
                        const min = Number(App.DOM.donutCutout.min) || 0;
                        const max = Number(App.DOM.donutCutout.max) || 100;
                        const percentage = ((Number(value) - min) / (max - min)) * 100;
                        App.DOM.donutCutout.style.setProperty('--value', `${percentage}%`);
                        debounceFastRender();
                    });
                    const value = Number(App.DOM.donutCutout.value);
                    const min = Number(App.DOM.donutCutout.min) || 0;
                    const max = Number(App.DOM.donutCutout.max) || 100;
                    const percentage = ((value - min) / (max - min)) * 100;
                    App.DOM.donutCutout.style.setProperty('--value', `${percentage}%`);
                }
                if (App.DOM.pieRadius && App.DOM.pieRadiusValue) {
                    App.DOM.pieRadius.addEventListener('input', (e) => {
                        const target = e.target;
                        const value = target.value;
                        App.DOM.pieRadiusValue.textContent = value;
                        const min = Number(App.DOM.pieRadius.min) || 0;
                        const max = Number(App.DOM.pieRadius.max) || 100;
                        const percentage = ((Number(value) - min) / (max - min)) * 100;
                        App.DOM.pieRadius.style.setProperty('--value', `${percentage}%`);
                        debounceFastRender();
                    });
                    const value = Number(App.DOM.pieRadius.value);
                    const min = Number(App.DOM.pieRadius.min) || 0;
                    const max = Number(App.DOM.pieRadius.max) || 100;
                    const percentage = ((value - min) / (max - min)) * 100;
                    App.DOM.pieRadius.style.setProperty('--value', `${percentage}%`);
                }
                if (App.DOM.areaOpacity && App.DOM.areaOpacityValue) {
                    App.DOM.areaOpacity.addEventListener('input', (e) => {
                        const target = e.target;
                        const value = target.value;
                        App.DOM.areaOpacityValue.textContent = value;
                        const min = Number(App.DOM.areaOpacity.min) || 0;
                        const max = Number(App.DOM.areaOpacity.max) || 100;
                        const percentage = ((Number(value) - min) / (max - min)) * 100;
                        App.DOM.areaOpacity.style.setProperty('--value', `${percentage}%`);
                        debounceFastRender();
                    });
                    const value = Number(App.DOM.areaOpacity.value);
                    const min = Number(App.DOM.areaOpacity.min) || 0;
                    const max = Number(App.DOM.areaOpacity.max) || 100;
                    const percentage = ((value - min) / (max - min)) * 100;
                    App.DOM.areaOpacity.style.setProperty('--value', `${percentage}%`);
                }
                if (App.DOM.histBins && App.DOM.histBinsValue) {
                    App.DOM.histBins.addEventListener('input', () => {
                        App.DOM.histBinsValue.textContent = App.DOM.histBins.value;
                        debounceFastRender();
                    });
                }
                if (App.DOM.exportScale && App.DOM.exportScaleValue) {
                    App.DOM.exportScale.addEventListener('input', (e) => {
                        const target = e.target;
                        const value = target.value;
                        App.DOM.exportScaleValue.textContent = value;
                        const min = Number(App.DOM.exportScale.min) || 1;
                        const max = Number(App.DOM.exportScale.max) || 5;
                        const percentage = ((Number(value) - min) / (max - min)) * 100;
                        App.DOM.exportScale.style.setProperty('--value', `${percentage}%`);
                    });
                    const value = Number(App.DOM.exportScale.value);
                    const min = Number(App.DOM.exportScale.min) || 1;
                    const max = Number(App.DOM.exportScale.max) || 5;
                    const percentage = ((value - min) / (max - min)) * 100;
                    App.DOM.exportScale.style.setProperty('--value', `${percentage}%`);
                }
                if (App.DOM.exportButton) {
                    App.DOM.exportButton.addEventListener('click', () => {
                        const type = (App.DOM.exportType ? App.DOM.exportType.value : 'png');
                        const scale = App.DOM.exportScale ? parseInt(App.DOM.exportScale.value || '1', 10) : 1;
                        const bg = App.DOM.exportBg ? App.DOM.exportBg.value : '#FFFFFF';
                        App.DOM.exportButton.classList.add('exporting');
                        setTimeout(() => {
                            App.DOM.exportButton.classList.remove('exporting');
                        }, 1000);
                        App.Export.exportChartImage(type, scale, bg);
                    });
                }
                let isFirstRender = true;
                const triggerRender = () => App.Renderers.ChartJS.renderChart();
                App.DOM.chartType.addEventListener('change', () => {
                    const nextType = App.DOM.chartType.value;
                    if (isFirstRender) {
                        isFirstRender = false;
                        triggerRender();
                        App.UI.Visibility.updateControlVisibility(nextType);
                        if (nextType === 'bar-line') {
                            App.UI.Controls.buildMixedTypeSelectors();
                        }
                    }
                    else {
                        App.UI.Motion.animateChartTransition(() => {
                            triggerRender();
                            App.UI.Visibility.updateControlVisibility(nextType);
                            if (nextType === 'bar-line') {
                                App.UI.Controls.buildMixedTypeSelectors();
                            }
                        });
                    }
                });
                App.DOM.chartTitle.addEventListener('blur', triggerRender);
                App.DOM.paletteSelect.addEventListener('change', (e) => {
                    const target = e.target;
                    App.Renderers.ChartJS.applyPalette(target.value);
                    App.UI.Controls.createDatasetControls();
                    App.UI.Visibility.refreshSingleSeriesOptions();
                    triggerRender();
                });
                App.DOM.exportBg.addEventListener('input', (e) => {
                    const target = e.target;
                    const normalizedColor = App.Utils.Color.normalizeColorToHex(target.value);
                    App.DOM.exportBg.value = normalizedColor;
                    triggerRender();
                });
                App.DOM.addDataset.addEventListener('click', () => {
                    const nextIndex = App.initialData.datasets.length;
                    const palette = App.getColorPalette(App.currentPaletteKey);
                    const color = palette[nextIndex % palette.length];
                    const randomData = Array.from({ length: App.initialData.labels.length }, () => {
                        return Math.max(0, Math.round(Math.random() * 20));
                    });
                    App.initialData.datasets.push({
                        label: `对比量 ${nextIndex + 1}`,
                        data: randomData,
                        backgroundColor: App.Utils.Color.hexToRgba(color, 0.7),
                        borderColor: App.Utils.Color.hexToRgba(color, 1),
                        borderWidth: 2,
                        type: 'bar',
                        yAxisID: 'y',
                        linePointStyle: 'circle',
                        lineBorderWidth: 2,
                        lineFill: false,
                        visible: true
                    });
                    App.UI.Controls.createDatasetControls();
                    App.UI.Visibility.refreshSingleSeriesOptions();
                    triggerRender();
                });
                App.DOM.removeDataset.addEventListener('click', () => {
                    if (App.initialData.datasets.length > 1) {
                        App.initialData.datasets.pop();
                        App.UI.Controls.createDatasetControls();
                        App.UI.Visibility.refreshSingleSeriesOptions();
                        triggerRender();
                    }
                    else {
                        alert('至少需要保留一个对比量');
                    }
                });
                App.DOM.resetDashboard.addEventListener('click', () => {
                    App.State.restoreDefaults();
                });
                App.DOM.orientationVertical.addEventListener('click', () => {
                    App.orientation = 'x';
                    App.DOM.orientationVertical.classList.add('active');
                    App.DOM.orientationHorizontal.classList.remove('active');
                    triggerRender();
                });
                App.DOM.orientationHorizontal.addEventListener('click', () => {
                    App.orientation = 'y';
                    App.DOM.orientationHorizontal.classList.add('active');
                    App.DOM.orientationVertical.classList.remove('active');
                    triggerRender();
                });
                App.DOM.axisSwapBtn?.addEventListener('click', () => {
                    if (App.DOM.xAxisTitle && App.DOM.yAxisLeftTitle) {
                        const tmp = App.DOM.xAxisTitle.value;
                        App.DOM.xAxisTitle.value = App.DOM.yAxisLeftTitle.value;
                        App.DOM.yAxisLeftTitle.value = tmp;
                        triggerRender();
                    }
                });
                App.DOM.themeLight.addEventListener('click', () => {
                    App.UI.Theme.applyLightTheme();
                });
                App.DOM.themeDark.addEventListener('click', () => {
                    App.UI.Theme.applyDarkTheme();
                });
                // 气泡图自定义XY数据控制
                if (App.DOM.bubbleUseCustomXY) {
                    App.DOM.bubbleUseCustomXY.addEventListener('change', () => {
                        const xyInputsDiv = document.getElementById('bubble-xy-inputs');
                        if (xyInputsDiv) {
                            xyInputsDiv.classList.toggle('hidden', !App.DOM.bubbleUseCustomXY?.checked);
                        }
                        triggerRender();
                    });
                }
                if (App.DOM.bubbleXData) {
                    App.DOM.bubbleXData.addEventListener('blur', triggerRender);
                }
                if (App.DOM.bubbleYData) {
                    App.DOM.bubbleYData.addEventListener('blur', triggerRender);
                }
            }
            Bindings.bindGlobalControls = bindGlobalControls;
        })(Bindings = UI.Bindings || (UI.Bindings = {}));
    })(UI = App.UI || (App.UI = {}));
})(App || (App = {}));
/// <reference path="../renderers/chartjs.ts" />
var App;
(function (App) {
    var UI;
    (function (UI) {
        var Motion;
        (function (Motion) {
            function animateChartTransition(callback) {
                const canvas = document.getElementById('myChart');
                const svg = document.getElementById('d3Chart');
                const activeElement = canvas && !canvas.classList.contains('hidden') ? canvas : svg;
                if (!activeElement) {
                    callback();
                    return;
                }
                activeElement.classList.add('chart-transition');
                setTimeout(() => {
                    callback();
                    setTimeout(() => activeElement.classList.remove('chart-transition'), 300);
                }, 150);
            }
            Motion.animateChartTransition = animateChartTransition;
            function showSuccessFeedback(element, duration = 600) {
                if (!element)
                    return;
                element.classList.add('success');
                setTimeout(() => element.classList.remove('success'), duration);
            }
            Motion.showSuccessFeedback = showSuccessFeedback;
        })(Motion = UI.Motion || (UI.Motion = {}));
    })(UI = App.UI || (App.UI = {}));
})(App || (App = {}));
/// <reference path="./app.types.ts" />
/// <reference path="./app.constants.ts" />
/// <reference path="./app.state.ts" />
/// <reference path="./utils/color.ts" />
/// <reference path="./utils/data.ts" />
/// <reference path="./utils/dom.ts" />
/// <reference path="./utils/helpers.ts" />
/// <reference path="./renderers/chartjs.ts" />
/// <reference path="./renderers/d3.ts" />
/// <reference path="./core/state.ts" />
/// <reference path="./core/export.ts" />
/// <reference path="./ui/controls.ts" />
/// <reference path="./ui/visibility.ts" />
/// <reference path="./ui/bindings.ts" />
/// <reference path="./ui/theme.ts" />
/// <reference path="./ui/motion.ts" />
var App;
(function (App) {
    document.addEventListener('DOMContentLoaded', () => {
        try {
            App.initializeState();
            App.Renderers.ChartJS.applyPalette(App.currentPaletteKey);
            App.UI.Theme.applyThemeBackground();
            App.UI.Visibility.refreshSingleSeriesOptions();
            App.UI.Controls.createDatasetControls();
            App.UI.Visibility.updateControlVisibility(App.DOM.chartType.value);
            App.UI.Bindings.bindDatasetContainer();
            App.UI.Bindings.bindGlobalControls();
            App.Renderers.ChartJS.renderChart();
            App.DOM.resetDashboard.addEventListener('click', () => {
                App.State.restoreDefaults();
                App.UI.Motion.showSuccessFeedback?.(App.DOM.resetDashboard);
            });
        }
        catch (error) {
            console.error('应用初始化失败:', error);
            alert('初始化应用时出现问题，请刷新页面重试。');
        }
    });
})(App || (App = {}));
//# sourceMappingURL=script.js.map