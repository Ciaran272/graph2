document.addEventListener('DOMContentLoaded', function () {
    const ctx = document.getElementById('myChart').getContext('2d');
    const svg = document.getElementById('d3Chart');
    let myChart;
    let currentPaletteKey = 'bright';

    const initialData = {
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

    // --- UI setup ---
    function createDatasetControls() {
        const container = document.getElementById('dataset-container');
        container.innerHTML = '';
        initialData.datasets.forEach((dataset, index) => {
            const item = document.createElement('div');
            item.classList.add('dataset-item');
            const colorHex = rgbaToHex(dataset.backgroundColor) || '#FF6B6B';
            const dataStr = (dataset.data || []).join(', ');
            item.innerHTML = `
                <div class="control-group">
                    <label for="dataset-name-${index}">名称</label>
                    <div class="inline-row">
                    <input type="text" id="dataset-name-${index}" value="${dataset.label}">
                        <button class="inline-btn" id="dataset-name-done-${index}">完成</button>
                        <div class="right-axis-control">
                            <label class="switch">
                                <input type="checkbox" id="dataset-right-${index}" ${dataset.yAxisID === 'y1' ? 'checked' : ''}>
                                <span class="slider"></span>
                            </label>
                            <span class="switch-label">绑定右轴</span>
                        </div>
                    </div>
                </div>
                <div class="control-group">
                    <label>显示控制</label>
                    <div class="inline-row">
                        <div class="visibility-control">
                            <label class="switch">
                                <input type="checkbox" id="dataset-visible-${index}" ${dataset.visible !== false ? 'checked' : ''}>
                                <span class="slider"></span>
                            </label>
                            <span class="switch-label">在图表中显示</span>
                        </div>
                    </div>
                </div>
                <div class="control-group color-input">
                    <label for="dataset-color-${index}">颜色</label>
                    <input type="color" id="dataset-color-${index}" value="${colorHex}">
                </div>
                <div class="control-group">
                    <label for="dataset-data-${index}">数据（逗号分隔）</label>
                    <textarea id="dataset-data-${index}" rows="2">${dataStr}</textarea>
                </div>
            `;
            container.appendChild(item);
        });
        refreshSingleSeriesOptions();
    }

    function refreshSingleSeriesOptions() {
        const select = document.getElementById('single-series-select');
        if (!select) return;
        const prev = select.value;
        select.innerHTML = '';
        
        // 只显示可见的数据系列
        initialData.datasets.forEach((ds, i) => {
            if (ds.visible !== false) {
                const opt = document.createElement('option');
                opt.value = String(i);
                opt.textContent = ds.label || `系列 ${i + 1}`;
                select.appendChild(opt);
            }
        });
        
        // 如果之前选择的系列仍然可见，保持选择
        if (prev && [...select.options].some(o => o.value === prev)) {
            const selectedDataset = initialData.datasets[parseInt(prev)];
            if (selectedDataset && selectedDataset.visible !== false) {
                select.value = prev;
            }
        }
        
        // 如果没有可见的系列或之前的选择不可见，选择第一个可见的
        if (!select.value && select.options.length > 0) {
            select.value = select.options[0].value;
        }
    }

    // --- Render ---
    function renderChart() {
        // Clear D3 SVG and hide
        clearD3();

        if (myChart) {
            myChart.destroy();
            myChart = null;
        }

        const chartType = document.getElementById('chart-type').value;
        const orientation = document.querySelector('#orientation-vertical').classList.contains('active') ? 'x' : 'y';
        
        // 过滤掉不可见的数据系列
        let datasets = JSON.parse(JSON.stringify(initialData.datasets.filter(ds => ds.visible !== false)));
        const labels = initialData.labels.slice();

        // 根据当前主题获取文字颜色
        const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
        const textColor = isDarkTheme ? '#e0e0e0' : '#222';
        
        // Common options
        const options = {
            indexAxis: orientation,
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: document.getElementById('chart-title').value,
                    color: textColor,
                    font: { size: 20, weight: '700' },
                    padding: { top: 8, bottom: 16 }
                },
                legend: { 
                    display: true,
                    labels: {
                        color: textColor
                    }
                },
                filler: { propagate: false, drawTime: 'beforeDatasetsDraw' }
            },
            scales: {}
        };

        // --- Chart.js based types ---
        if (chartType === 'bar' || chartType === 'bar-stacked' || chartType === 'line' || chartType === 'area' || chartType === 'area-stacked' || chartType === 'bar-line' || chartType === 'pie' || chartType === 'donut' || chartType === 'radar' || chartType === 'histogram') {
            // Handle special types
            let typeForConfig = chartType;

        if (chartType === 'bar-line') {
            // 使用混合类型选择器为每个系列指定 bar 或 line，并应用折线配置
             datasets.forEach((ds, i) => {
                const sel = document.getElementById(`mixed-type-${i}`);
                const choice = sel ? sel.value : (i % 2 === 0 ? 'bar' : 'line');
                ds.type = choice;
                if (choice === 'line') {
                    const pt = document.getElementById(`mixed-point-${i}`);
                    const wd = document.getElementById(`mixed-width-${i}`);
                    const fl = document.getElementById(`mixed-fill-${i}`);
                    ds.pointStyle = pt ? pt.value : (initialData.datasets[i].linePointStyle || 'circle');
                    ds.borderWidth = wd ? Number(wd.value) : (initialData.datasets[i].lineBorderWidth || 2);
                    ds.fill = fl ? fl.checked : !!initialData.datasets[i].lineFill;
                    ds.tension = 0.3;
                }
            });
            typeForConfig = 'bar';
        }

            // 处理轴标题
            applyAxisTitles(options);

            if (chartType === 'line') {
                datasets.forEach(ds => {
                    ds.type = 'line';
                    ds.fill = false; // 纯折线图不需要填充
                    ds.tension = 0.3;
                });
                typeForConfig = 'line';
            }

            if (chartType === 'area' || chartType === 'area-stacked') {
                // 完全重新构建数据集以避免 Chart.js 缓存问题
                datasets = datasets.map((ds, index) => {
                    const baseHex = colorToHex(ds.borderColor || ds.backgroundColor) || '#4ECDC4';
                    const alphaPct = parseInt(document.getElementById('area-opacity').value || '35', 10);
                    const alpha = Math.max(0, Math.min(100, alphaPct)) / 100;
                    
                    const newDataset = {
                        label: ds.label,
                        data: ds.data.slice(),
                        type: 'line',
                        fill: true,
                        borderColor: hexToRgba(baseHex, 1),
                        backgroundColor: hexToRgba(baseHex, alpha),
                        borderWidth: 2,
                        tension: 0.3,
                        yAxisID: ds.yAxisID || 'y'
                    };
                    
                    if (chartType === 'area-stacked') {
                        newDataset.stack = 'stack1';
                    }
                    
                    return newDataset;
                });
                
                if (chartType === 'area-stacked') {
                    options.scales.y = options.scales.y || {};
                    options.scales.y.stacked = true;
                }
                typeForConfig = 'line';
            }

            if (chartType === 'bar-stacked') {
                options.scales.x = options.scales.x || {};
                options.scales.y = options.scales.y || {};
                options.scales.x.stacked = true;
                options.scales.y.stacked = true;
                datasets.forEach(ds => { ds.type = 'bar'; });
                typeForConfig = 'bar';
            }

            if (chartType === 'pie' || chartType === 'donut') {
                // Single-series selection
                const idx = parseInt(document.getElementById('single-series-select').value || '0', 10) || 0;
                const base = datasets[idx] || datasets[0];
                let segColors;
                const palettes = getPalettes();
                const scheme = palettes[currentPaletteKey];
                if (scheme && scheme.length) {
                    segColors = getPaletteColorsForCount(scheme, labels.length);
                } else {
                    segColors = generateSegmentColors(base.backgroundColor, labels.length);
                }
                datasets = [{
                    label: base.label,
                    data: base.data,
                    backgroundColor: segColors,
                    borderColor: base.borderColor,
                    borderWidth: 1
                }];
                typeForConfig = (chartType === 'donut') ? 'doughnut' : 'pie';
                const cut = document.getElementById('donut-cutout').value + '%';
                options.cutout = (chartType === 'donut') ? cut : '0%';
                const radiusPct = parseInt(document.getElementById('pie-radius').value || '65', 10);
                options.radius = radiusPct + '%';
                options.indexAxis = 'x';
                // 强制隐藏所有 XY 坐标轴与网格
                options.scales = {
                    x: { display: false, grid: { display: false }, ticks: { display: false } },
                    y: { display: false, grid: { display: false }, ticks: { display: false } }
                };
                // 隐藏图例
                options.plugins.legend = { display: false };
                
                // 添加自定义插件来显示饼图外部标签
                options.plugins.pieExternalLabels = {
                    id: 'pieExternalLabels',
                    afterDatasetsDraw(chart) {
                        const ctx = chart.ctx;
                        const chartData = chart.data;
                        const meta = chart.getDatasetMeta(0);
                        
                        if (meta.hidden) return;
                        
                        const total = chartData.datasets[0].data.reduce((sum, value) => sum + value, 0);
                        
                        // 获取当前主题的文字颜色
                        const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
                        const textColor = isDarkTheme ? '#e0e0e0' : '#333';
                        const lineColor = isDarkTheme ? '#888' : '#666';
                        
                        chartData.datasets[0].data.forEach((value, index) => {
                            const arc = meta.data[index];
                            if (!arc) return;
                            
                            const { x, y, startAngle, endAngle, outerRadius } = arc;
                            
                            // 计算百分比
                            const percentage = ((value / total) * 100).toFixed(1);
                            
                            // 如果扇形太小，不显示标签
                            if (percentage < 1) return;
                            
                            // 计算中间角度
                            const midAngle = (startAngle + endAngle) / 2;
                            
                            // 计算引导线的起点（在饼图边缘）
                            const lineStartRadius = outerRadius;
                            const lineStartX = x + Math.cos(midAngle) * lineStartRadius;
                            const lineStartY = y + Math.sin(midAngle) * lineStartRadius;
                            
                            // 计算引导线的中间点（向外延伸）
                            const lineMidRadius = outerRadius + 20;
                            const lineMidX = x + Math.cos(midAngle) * lineMidRadius;
                            const lineMidY = y + Math.sin(midAngle) * lineMidRadius;
                            
                            // 确定标签位置（左侧或右侧）
                            const isLeftSide = Math.cos(midAngle) < 0;
                            
                            // 计算水平线的终点
                            const horizontalLineLength = 40;
                            const lineEndX = lineMidX + (isLeftSide ? -horizontalLineLength : horizontalLineLength);
                            const lineEndY = lineMidY;
                            
                            // 绘制引导线
                            ctx.save();
                            ctx.strokeStyle = lineColor;
                            ctx.lineWidth = 1.5;
                            ctx.beginPath();
                            ctx.moveTo(lineStartX, lineStartY);
                            ctx.lineTo(lineMidX, lineMidY);
                            ctx.lineTo(lineEndX, lineEndY);
                            ctx.stroke();
                            
                            // 获取标签文本
                            const labelText = chartData.labels[index] || `项目 ${index + 1}`;
                            
                            // 绘制标签文本
                            ctx.textAlign = isLeftSide ? 'right' : 'left';
                            ctx.textBaseline = 'middle';
                            ctx.fillStyle = textColor;
                            
                            // 标签名称（大字）
                            ctx.font = 'bold 16px Arial';
                            const textX = lineEndX + (isLeftSide ? -8 : 8);
                            ctx.fillText(labelText, textX, lineEndY - 10);
                            
                            // 百分比（小字）
                            ctx.font = '14px Arial';
                            ctx.fillText(`${percentage}%`, textX, lineEndY + 10);
                            
                            ctx.restore();
                        });
                    }
                };
            }

            if (chartType === 'radar') {
                // 完全重新构建数据集以避免 Chart.js 缓存问题
                datasets = datasets.map((ds, index) => {
                    const baseHex = colorToHex(ds.borderColor || ds.backgroundColor) || '#4ECDC4';
                    const alphaPct = parseInt(document.getElementById('area-opacity').value || '35', 10);
                    const alpha = Math.max(0, Math.min(100, alphaPct)) / 100;
                    
                    const newDataset = {
                        label: ds.label,
                        data: ds.data.slice(),
                        type: 'radar',
                        fill: true,
                        borderColor: hexToRgba(baseHex, 1),
                        backgroundColor: hexToRgba(baseHex, alpha),
                        borderWidth: 2
                    };
                    
                    return newDataset;
                });
                
                typeForConfig = 'radar';
                options.indexAxis = 'x';
                options.scales = {
                    x: { display: false, grid: { display: false }, ticks: { display: false } },
                    y: { display: false, grid: { display: false }, ticks: { display: false } },
                    r: {
                        angleLines: { 
                            display: true,
                            color: isDarkTheme ? '#404040' : '#e0e0e0'
                        },
                        suggestedMin: 0,
                        ticks: {
                            display: false, // 隐藏默认刻度标签，我们手动绘制
                            stepSize: undefined
                        },
                        pointLabels: {
                            display: true,
                            font: { size: 12, weight: 'bold' },
                            color: textColor
                        },
                        grid: { 
                            display: true,
                            color: isDarkTheme ? '#404040' : '#e0e0e0'
                        }
                    }
                };
                options.elements = options.elements || {};
                options.elements.line = Object.assign({}, options.elements.line, { borderWidth: 2 });
                options.elements.point = Object.assign({}, options.elements.point, { radius: 4 });
                
                // 添加自定义插件来显示每个轴的刻度标签
                options.plugins.tooltip = {
                    enabled: true
                };
                
                options.plugins.radarAxisLabels = {
                    id: 'radarAxisLabels',
                    afterDatasetsDraw(chart) {
                        const ctx = chart.ctx;
                        const scale = chart.scales.r;
                        const labels = chart.data.labels;
                        
                        // 计算合适的刻度值
                        const maxValue = Math.max(...chart.data.datasets.flatMap(ds => ds.data));
                        const tickCount = 5; // 显示5个刻度
                        const stepSize = Math.ceil(maxValue / tickCount);
                        
                        // 获取当前主题的文字颜色
                        const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
                        const radarTextColor = isDarkTheme ? '#e0e0e0' : '#333';
                        
                        // 为每条轴绘制刻度标签
                        labels.forEach((label, index) => {
                            // 修正角度计算 - 使用正确的角度计算方法
                            const angleInRadians = scale.getIndexAngle(index) - Math.PI / 2; // 减去90度，因为Chart.js的0度是从3点钟方向开始
                            
                            // 在每条轴上绘制多个刻度值
                            for (let i = 1; i <= tickCount; i++) {
                                const tickValue = stepSize * i;
                                if (tickValue > maxValue * 1.1) break; // 不超过最大值太多
                                
                                const radius = scale.getDistanceFromCenterForValue(tickValue);
                                
                                // 精确计算位置 - 确保标签在轴线上
                                const x = scale.xCenter + Math.cos(angleInRadians) * radius;
                                const y = scale.yCenter + Math.sin(angleInRadians) * radius;
                                
                                ctx.save();
                                ctx.font = 'bold 10px Arial';
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'middle';
                                
                                // 使用主题适配的文字颜色
                                const text = tickValue.toString();
                                ctx.fillStyle = radarTextColor;
                                ctx.fillText(text, x, y);
                                ctx.restore();
                            }
                        });
                    }
                };
            }

            if (chartType === 'histogram') {
                const idx = parseInt(document.getElementById('single-series-select').value || '0', 10) || 0;
                const binsCount = parseInt(document.getElementById('hist-bins').value, 10) || 10;
                const base = initialData.datasets[idx] || initialData.datasets[0];
                const { binLabels, binValues } = computeHistogram(base.data, binsCount);
                const color = base.backgroundColor;
                datasets = [{
                    label: `${base.label} 直方图`,
                    data: binValues,
                    backgroundColor: color,
                    borderColor: adjustAlpha(color, 1),
                    borderWidth: 1,
                    type: 'bar'
                }];
                typeForConfig = 'bar';
                options.indexAxis = 'x';
                updateSelectedSeriesNote(base.label);
                return renderChartJS(typeForConfig, binLabels, datasets, options, chartType);
            }

            // 根据 yAxisID 决定双轴，并加粗轴标题
            const anyRight = datasets.some(ds => ds.yAxisID === 'y1');
            if (anyRight) {
                options.scales.y = options.scales.y || {};
                options.scales.y1 = options.scales.y1 || { position: 'right', grid: { drawOnChartArea: false } };
            } else if (options.scales.y1) {
                delete options.scales.y1;
            }
            // X/Y 轴标题样式
            const xTitle = document.getElementById('x-axis-title').value || '';
            const yLeft = document.getElementById('y-axis-left-title').value || '';
            const yRight = document.getElementById('y-axis-right-title').value || '';
            options.scales.x = options.scales.x || {};
            options.scales.y = options.scales.y || {};
            
            // 设置轴标题和刻度颜色
            options.scales.x.title = { display: !!xTitle, text: xTitle, color: textColor, font: { size: 14, weight: '600' } };
            options.scales.y.title = { display: !!yLeft, text: yLeft, color: textColor, font: { size: 14, weight: '600' } };
            options.scales.x.ticks = { color: textColor };
            options.scales.y.ticks = { color: textColor };
            options.scales.x.grid = { color: isDarkTheme ? '#404040' : '#e0e0e0' };
            options.scales.y.grid = { color: isDarkTheme ? '#404040' : '#e0e0e0' };
            
            if (anyRight && yRight) {
                options.scales.y1.title = { display: true, text: yRight, color: textColor, font: { size: 14, weight: '600' } };
                options.scales.y1.ticks = { color: textColor };
            }
            const res = renderChartJS(typeForConfig, labels, datasets, options, chartType);
            if (chartType === 'pie' || chartType === 'donut') {
                const idx = parseInt(document.getElementById('single-series-select').value || '0', 10) || 0;
                const base = initialData.datasets[idx] || initialData.datasets[0];
                updateSelectedSeriesNote(base.label);
        } else {
                updateSelectedSeriesNote('');
            }
            return res;
        }

        // --- D3 based types ---
        if (chartType === 'streamgraph') {
            updateSelectedSeriesNote('');
            // 对流图也过滤可见的数据系列
            const visibleDatasets = initialData.datasets.filter(ds => ds.visible !== false);
            return renderD3Streamgraph(labels, visibleDatasets);
        }
        if (chartType === 'treemap') {
            // 对矩形树图，需要从可见的数据系列中选择
            const visibleDatasets = initialData.datasets.filter(ds => ds.visible !== false);
            const idx = parseInt(document.getElementById('single-series-select').value || '0', 10) || 0;
            
            // 如果选择的系列不可见，则选择第一个可见的系列
            let selectedDataset = initialData.datasets[idx];
            if (!selectedDataset || selectedDataset.visible === false) {
                selectedDataset = visibleDatasets[0] || initialData.datasets[0];
            }
            
            updateSelectedSeriesNote(selectedDataset ? selectedDataset.label : '');
            return renderD3Treemap(labels, selectedDataset);
        }
    }

    function renderChartJS(typeForConfig, labels, datasets, options, chartType) {
        // Show canvas, hide SVG
        svg.classList.add('hidden');
        let canvas = document.getElementById('myChart');
        canvas.classList.remove('hidden');

        // 强制销毁并重新创建 canvas 以避免 Chart.js 缓存问题
        if (chartType === 'area' || chartType === 'area-stacked' || chartType === 'radar') {
            const parent = canvas.parentNode;
            const newCanvas = document.createElement('canvas');
            newCanvas.id = 'myChart';
            newCanvas.width = canvas.width;
            newCanvas.height = canvas.height;
            parent.replaceChild(newCanvas, canvas);
            canvas = newCanvas;
            // 维持背景色实时预览
            const exportBgEl = document.getElementById('export-bg');
            const bgLive = (exportBgEl && exportBgEl.value) || '#FFFFFF';
            canvas.style.backgroundColor = bgLive;
        }

        const currentCtx = canvas.getContext('2d');
        
        // 注册自定义插件
        const plugins = [];
        if (options.plugins && options.plugins.radarAxisLabels) {
            plugins.push(options.plugins.radarAxisLabels);
        }
        if (options.plugins && options.plugins.pieExternalLabels) {
            plugins.push(options.plugins.pieExternalLabels);
        }
        
        myChart = new Chart(currentCtx, {
            type: (typeForConfig === 'area' || typeForConfig === 'area-stacked') ? 'line' : typeForConfig,
            data: {
                labels: labels,
                datasets: datasets
            },
            options: options,
            plugins: plugins
        });
    }

    function updateSelectedSeriesNote(text) {
        const note = document.getElementById('chart-selected-label');
        if (!note) return;
        if (text) {
            note.textContent = `当前系列：${text}`;
            note.classList.remove('hidden');
        } else {
            note.textContent = '';
            note.classList.add('hidden');
        }
    }

    function clearD3() {
        // Hide canvas when using D3
        const canvas = document.getElementById('myChart');
        while (svg.firstChild) svg.removeChild(svg.firstChild);
        svg.classList.add('hidden');
        canvas.classList.remove('hidden');
    }

    function sizeSVG() {
        const container = document.querySelector('.chart-wrap');
        const width = container.clientWidth;
        const height = container.clientHeight;
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        // 设置viewBox确保SVG内容正确缩放
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        return { width, height };
    }

    function renderD3Streamgraph(labels, datasets) {
        const { width, height } = sizeSVG();
        // 设置更合适的边距
        const margin = { top: 40, right: 40, bottom: 60, left: 40 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;
        
        // Prepare data for d3.stack: array of objects per x index
        const keys = datasets.map(d => d.label);
        const dataByIndex = labels.map((_, i) => {
            const obj = {};
            datasets.forEach(ds => { obj[ds.label] = Number(ds.data[i] || 0); });
            return obj;
        });

        const stack = d3.stack().keys(keys).offset(d3.stackOffsetWiggle);
        const series = stack(dataByIndex);

        // X scale: point across labels
        const x = d3.scalePoint().domain(labels).range([0, chartWidth]);

        // Y domain
        const yExtent = [
            d3.min(series, s => d3.min(s, d => d[0])),
            d3.max(series, s => d3.max(s, d => d[1]))
        ];
        const y = d3.scaleLinear().domain(yExtent).nice().range([chartHeight, 0]);

        // Show SVG, hide canvas
        svg.classList.remove('hidden');
        document.getElementById('myChart').classList.add('hidden');

        const g = d3.select(svg).append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const area = d3.area()
            .x((d, i) => x(labels[i]))
            .y0(d => y(d[0]))
            .y1(d => y(d[1]))
            .curve(d3.curveCatmullRom.alpha(0.5));

        // Color per dataset
        const colorByLabel = new Map();
        datasets.forEach(ds => {
            colorByLabel.set(ds.label, rgbaToHex(ds.backgroundColor) || '#999999');
        });

        g.selectAll('path.layer')
            .data(series)
            .enter()
            .append('path')
            .attr('class', 'layer')
            .attr('d', d => area(d))
            .attr('fill', (d, i) => colorByLabel.get(keys[i]))
            .attr('opacity', 0.85);

        // Title & axis titles (SVG) - 更新位置以适应新的边距系统
        const svgFont = 16;
        const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
        const svgColor = isDarkTheme ? '#e0e0e0' : '#222';
        const svgSecondaryColor = isDarkTheme ? '#888' : '#666';

        // 图表标题 - 位于顶部居中
        d3.select(svg).append('text')
            .attr('x', width / 2)
            .attr('y', 25)
            .attr('fill', svgColor)
            .attr('font-size', 18)
            .attr('font-weight', '600')
            .attr('text-anchor', 'middle')
            .text(document.getElementById('chart-title').value);

        // X axis labels - 位于图表底部
        g.selectAll('text.xlbl')
            .data(labels)
            .enter()
            .append('text')
            .attr('class', 'xlbl')
            .attr('x', d => x(d))
            .attr('y', chartHeight + 20)
            .attr('text-anchor', 'middle')
            .attr('font-size', 12)
            .attr('fill', svgSecondaryColor)
            .text(d => d);

        // SVG axis titles - 调整位置以适应新的坐标系统
        const xTitle = document.getElementById('x-axis-title').value || '';
        if (xTitle) {
            d3.select(svg).append('text')
                .attr('x', width / 2)
                .attr('y', height - 10)
                .attr('text-anchor', 'middle')
                .attr('fill', svgColor)
                .attr('font-size', svgFont)
                .text(xTitle);
        }
        const yLeft = document.getElementById('y-axis-left-title').value || '';
        if (yLeft) {
            d3.select(svg).append('text')
                .attr('transform', `translate(15, ${height/2}) rotate(-90)`) 
                .attr('text-anchor', 'middle')
                .attr('fill', svgColor)
                .attr('font-size', svgFont)
                .text(yLeft);
        }
        const yRight = document.getElementById('y-axis-right-title').value || '';
        if (yRight) {
            d3.select(svg).append('text')
                .attr('transform', `translate(${width - 15}, ${height/2}) rotate(90)`) 
                .attr('text-anchor', 'middle')
                .attr('fill', svgColor)
                .attr('font-size', svgFont)
                .text(yRight);
        }
    }

    function renderD3Treemap(labels, dataset) {
        const { width, height } = sizeSVG();
        // 设置边距以确保内容不会被截断
        const margin = { top: 20, right: 20, bottom: 20, left: 20 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;
        
        svg.classList.remove('hidden');
        document.getElementById('myChart').classList.add('hidden');

        const values = (dataset.data || []).map(v => Number(v || 0));
        const root = d3.hierarchy({ name: dataset.label, children: labels.map((l, i) => ({ name: l, value: values[i] || 0 })) })
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value);

        d3.treemap().size([chartWidth, chartHeight]).padding(3)(root);

        const g = d3.select(svg).append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);
        const baseHex = rgbaToHex(dataset.backgroundColor) || '#4ECDC4';
        const color = d3.scaleLinear()
            .domain([0, d3.max(values) || 1])
            .range([d3.color(baseHex).brighter(1.5), d3.color(baseHex).darker(0.5)]);

        const nodes = g.selectAll('g.node')
            .data(root.leaves())
            .enter()
            .append('g')
            .attr('class', 'node')
            .attr('transform', d => `translate(${d.x0},${d.y0})`);

        nodes.append('rect')
            .attr('width', d => Math.max(0, d.x1 - d.x0))
            .attr('height', d => Math.max(0, d.y1 - d.y0))
            .attr('fill', d => color(d.value))
            .attr('stroke', '#fff')
            .attr('rx', 6)
            .attr('ry', 6);

        // 计算所有矩形的面积，用于比例计算
        const allAreas = [];
        root.leaves().forEach(d => {
            const width = Math.max(0, d.x1 - d.x0);
            const height = Math.max(0, d.y1 - d.y0);
            allAreas.push(width * height);
        });
        const maxArea = Math.max(...allAreas);
        const minArea = Math.min(...allAreas);

        // 获取当前主题的文字颜色
        const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
        const treemapTextColor = isDarkTheme ? '#e0e0e0' : '#223';
        
        nodes.append('text')
            .attr('fill', treemapTextColor)
            .attr('font-weight', 'bold')
            .text(d => `${d.data.name}: ${d.value}`)
            .each(function(d) {
                const rectWidth = Math.max(0, d.x1 - d.x0);
                const rectHeight = Math.max(0, d.y1 - d.y0);
                const rectArea = rectWidth * rectHeight;
                
                // 如果矩形太小，不显示文字
                if (rectWidth < 40 || rectHeight < 20) {
                    d3.select(this).style('display', 'none');
                    return;
                }
                
                // 按面积比例计算字体大小 - 更明显的比例差异
                const areaRatio = rectArea / maxArea; // 当前面积占最大面积的比例
                const minFontSize = 10;
                const maxFontSize = 28;
                
                // 使用平方根来缓解极端差异，但保持明显的比例关系
                let fontSize = minFontSize + (maxFontSize - minFontSize) * Math.sqrt(areaRatio);
                fontSize = Math.round(fontSize);
                
                d3.select(this).attr('font-size', fontSize);
                
                // 居中定位
                const centerX = rectWidth / 2;
                const centerY = rectHeight / 2;
                d3.select(this)
                    .attr('x', centerX)
                    .attr('y', centerY)
                    .attr('text-anchor', 'middle')
                    .attr('dominant-baseline', 'middle');
                
                // 自适应文本长度
                const maxW = rectWidth - 8; // 留一些边距
                const self = d3.select(this);
                let txt = self.text();
                
                // 确保文字不超过矩形宽度
                while (this.getComputedTextLength && this.getComputedTextLength() > maxW && fontSize > minFontSize) {
                    fontSize--;
                    self.attr('font-size', fontSize);
                }
                
                // 如果缩小字体还是太长，就截断文字
                while (this.getComputedTextLength && this.getComputedTextLength() > maxW && txt.length > 3) {
                    txt = txt.slice(0, -1);
                    self.text(txt + '…');
                }
                
                // 确保字体不超过矩形高度的限制
                const maxHeightBasedSize = rectHeight * 0.4; // 字体不超过矩形高度的40%
                if (fontSize > maxHeightBasedSize) {
                    fontSize = Math.max(minFontSize, Math.floor(maxHeightBasedSize));
                    self.attr('font-size', fontSize);
                }
            });

        // Treemap 不显示图表标题与轴标题
    }

    // --- Update settings ---
    function updateChartSettings() {
        // Labels
        const labelsInput = document.getElementById('labels-input').value || '';
        const labels = labelsInput.split(/[,，]/).map(s => s.trim()).filter(s => s.length > 0);
        if (labels.length > 0) initialData.labels = labels;

        // Datasets
        initialData.datasets.forEach((dataset, index) => {
            const nameInput = document.getElementById(`dataset-name-${index}`);
            const colorInput = document.getElementById(`dataset-color-${index}`);
            const dataInput = document.getElementById(`dataset-data-${index}`);
            if (nameInput) {
                dataset.label = nameInput.value || dataset.label;
                // 同步更新卡片标题
                const card = nameInput.closest('.dataset-item');
                if (card) {
                    const title = card.querySelector('h5');
                    if (title) title.textContent = dataset.label;
                }
            }
            if (colorInput) {
                const bg = hexToRgba(colorInput.value, 0.7);
                dataset.backgroundColor = bg;
                dataset.borderColor = adjustAlpha(bg, 1);
            }
            if (dataInput) {
                const arr = parseCSVNumbers(dataInput.value);
                dataset.data = normalizeArrayLength(arr, initialData.labels.length);
            } else {
                dataset.data = normalizeArrayLength(dataset.data || [], initialData.labels.length);
            }
        });

        refreshSingleSeriesOptions();
        renderChart();
    }

    // --- Events ---
    // 即时更新：输入变动（部分控件）重绘（防抖）；文本输入改为 blur 触发
    const debouncedUpdate = debounce(updateChartSettings, 200);
    ['labels-input','chart-title','x-axis-title','y-axis-left-title','y-axis-right-title'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('blur', updateChartSettings);
    });
    document.getElementById('single-series-select').addEventListener('change', debouncedUpdate);
    document.getElementById('donut-cutout').addEventListener('input', debouncedUpdate);
    document.getElementById('pie-radius').addEventListener('input', debouncedUpdate);
    document.getElementById('hist-bins').addEventListener('input', debouncedUpdate);
    document.getElementById('area-opacity').addEventListener('input', debouncedUpdate);
    document.getElementById('orientation-vertical').addEventListener('click', () => { maybeSwapAxisOnOrientation('x'); debouncedUpdate(); });
    document.getElementById('orientation-horizontal').addEventListener('click', () => { maybeSwapAxisOnOrientation('y'); debouncedUpdate(); });
    // 混合图显示细化设置在 mixed-types-group 中处理

    function bindDatasetInputsInstant() {
        const inputs = document.querySelectorAll('#dataset-container input, #dataset-container textarea, #dataset-container select');
        inputs.forEach(el => {
            // 移除已有的事件监听器，避免重复绑定
            el.removeEventListener('input', el._colorHandler);
            el.removeEventListener('blur', el._blurHandler);
            el.removeEventListener('change', el._changeHandler);
            if (el.type === 'text' || el.tagName === 'TEXTAREA') {
                // 名称在输入时同步卡片标题，失焦后应用到图表
                if (el.id && el.id.startsWith('dataset-name-')) {
                    // 名称输入时不需要同步标题了，因为已经删除了h5标题
                    // 完成按钮：点击后立即应用并刷新
                    const idx = Number(el.id.replace('dataset-name-',''));
                    const doneBtn = document.getElementById(`dataset-name-done-${idx}`);
                    if (doneBtn) {
                        doneBtn.addEventListener('click', () => {
                            updateChartSettings();
                            // 点击完成后，重新绑定事件，确保新生成的控件也连接
                            createDatasetControls();
                            bindDatasetInputsInstant();
                        });
                    }
                }
                el._blurHandler = () => {
                    updateChartSettings();
                    // 失焦后控件可能被重建，重新绑定
                    createDatasetControls();
                    bindDatasetInputsInstant();
                };
                el.addEventListener('blur', el._blurHandler);
            } else if (el.type === 'color') {
                // 颜色输入即时更新
                el._colorHandler = () => {
                    // 直接更新数据和渲染图表，不重建控件
                    const index = parseInt(el.id.replace('dataset-color-', ''));
                    if (!isNaN(index) && initialData.datasets[index]) {
                        const bg = hexToRgba(el.value, 0.7);
                        initialData.datasets[index].backgroundColor = bg;
                        initialData.datasets[index].borderColor = adjustAlpha(bg, 1);
                        renderChart();
                    }
                };
                el.addEventListener('input', el._colorHandler);
            } else {
                el._changeHandler = debouncedUpdate;
                el.addEventListener('change', el._changeHandler);
            }
        });
        // 绑定右轴开关
        initialData.datasets.forEach((_, index) => {
            const right = document.getElementById(`dataset-right-${index}`);
            if (right) {
                right.addEventListener('change', () => {
                    initialData.datasets[index].yAxisID = right.checked ? 'y1' : 'y';
                    debouncedUpdate();
                });
            }
        });
        
        // 绑定可见性切换开关
        initialData.datasets.forEach((_, index) => {
            const visible = document.getElementById(`dataset-visible-${index}`);
            if (visible) {
                visible.addEventListener('change', () => {
                    initialData.datasets[index].visible = visible.checked;
                    refreshSingleSeriesOptions(); // 更新单系列选择器
                    debouncedUpdate();
                });
            }
        });
        
        buildMixedTypeSelectors();
    }

    function buildMixedTypeSelectors() {
        const group = document.getElementById('mixed-types-group');
        const container = document.getElementById('mixed-types-container');
        if (!group || !container) return;
        const t = document.getElementById('chart-type').value;
        group.classList.toggle('hidden', t !== 'bar-line');
        if (t !== 'bar-line') return;
        container.innerHTML = '';
        initialData.datasets.forEach((ds, i) => {
            const block = document.createElement('div');
            block.className = 'dataset-item';
            const header = document.createElement('h5');
            header.textContent = ds.label;
            block.appendChild(header);

            // 类型选择
            const typeRow = document.createElement('div');
            typeRow.className = 'inline-row';
            const typeLabel = document.createElement('span');
            typeLabel.textContent = '类型';
            typeLabel.style.minWidth = '44px';
            const typeSelect = document.createElement('select');
            typeSelect.id = `mixed-type-${i}`;
            ['bar','line'].forEach(type => {
                const opt = document.createElement('option');
                opt.value = type; opt.textContent = (type === 'bar' ? '柱状' : '折线');
                if (ds.type === type) opt.selected = true;
                typeSelect.appendChild(opt);
            });
            typeSelect.addEventListener('change', debouncedUpdate);
            typeRow.appendChild(typeLabel);
            typeRow.appendChild(typeSelect);
            block.appendChild(typeRow);

            // 仅折线时可调：点样式、线宽、是否填充
            const cfgRow = document.createElement('div');
            cfgRow.className = 'inline-row';
            cfgRow.style.marginTop = '8px';

            const pointSelect = document.createElement('select');
            pointSelect.id = `mixed-point-${i}`;
            ['circle','rect','triangle','cross','star','line','dash'].forEach(p => {
                const opt = document.createElement('option');
                opt.value = p; opt.textContent = `点:${p}`;
                if (ds.linePointStyle === p) opt.selected = true;
                pointSelect.appendChild(opt);
            });

            const widthInput = document.createElement('input');
            widthInput.type = 'number';
            widthInput.min = '1';
            widthInput.max = '8';
            widthInput.step = '1';
            widthInput.id = `mixed-width-${i}`;
            widthInput.value = String(ds.lineBorderWidth || 2);

            const fillToggle = document.createElement('label');
            fillToggle.className = 'switch';
            fillToggle.style.marginLeft = '10px';
            const fillInput = document.createElement('input');
            fillInput.type = 'checkbox';
            fillInput.id = `mixed-fill-${i}`;
            fillInput.checked = !!ds.lineFill;
            const slider = document.createElement('span');
            slider.className = 'slider';
            fillToggle.appendChild(fillInput);
            fillToggle.appendChild(slider);

            [pointSelect, widthInput, fillInput].forEach(el => el.addEventListener('change', debouncedUpdate));

            cfgRow.appendChild(pointSelect);
            cfgRow.appendChild(widthInput);
            cfgRow.appendChild(fillToggle);

            block.appendChild(cfgRow);
            container.appendChild(block);
        });
    }
    document.getElementById('apply-palette').addEventListener('click', () => {
        // 先保存当前输入状态，避免覆盖为旧值
        updateChartSettings();
        const key = document.getElementById('palette-select').value;
        currentPaletteKey = key;
        const palettes = getPalettes();
        const scheme = palettes[key] || palettes['bright'];
        // apply to datasets background
        initialData.datasets.forEach((ds, i) => {
            const hex = scheme[i % scheme.length];
            ds.backgroundColor = hexToRgba(hex, 0.7);
            ds.borderColor = hexToRgba(hex, 1);
        });
        createDatasetControls();
        bindDatasetInputsInstant();
        renderChart();
    });
    
    document.getElementById('chart-type').addEventListener('change', (e) => {
        const t = e.target.value;
        // Mixed types visibility
        document.getElementById('mixed-types-group').classList.toggle('hidden', t !== 'bar-line');

        // Orientation visibility (hide for pie/donut/radar/treemap/streamgraph/histogram)
        const hideOrientation = (t === 'pie' || t === 'donut' || t === 'radar' || t === 'treemap' || t === 'streamgraph' || t === 'histogram');
        
        // 只隐藏方向切换按钮，不影响主题切换按钮
        document.querySelectorAll('.toggle-switch button').forEach(btn => {
            // 检查是否是方向切换按钮
            if (btn.id === 'orientation-vertical' || btn.id === 'orientation-horizontal') {
                btn.parentElement.parentElement.classList.toggle('hidden', hideOrientation);
            }
        });

        // Single series selector for pie/donut/histogram/treemap
        document.getElementById('single-series-wrap').classList.toggle('hidden', !(t === 'pie' || t === 'donut' || t === 'histogram' || t === 'treemap'));

        // Donut cutout slider
        document.getElementById('donut-wrap').classList.toggle('hidden', t !== 'donut');
        // Pie/Donut radius slider
        document.getElementById('pie-size-wrap').classList.toggle('hidden', !(t === 'pie' || t === 'donut'));

        // Histogram bins slider
        document.getElementById('hist-wrap').classList.toggle('hidden', t !== 'histogram');
        // Area opacity slider visible for area/stacked area
        document.getElementById('area-opacity-wrap').classList.toggle('hidden', !(t === 'area' || t === 'area-stacked' || t === 'radar'));

        // 轴标题输入在 Treemap 下隐藏
        const axisTitleWrap = document.getElementById('axis-title-wrap');
        if (axisTitleWrap) axisTitleWrap.classList.toggle('hidden', t === 'treemap');
        if (t === 'bar-line') buildMixedTypeSelectors();
        debouncedUpdate();
    });

    document.getElementById('add-dataset').addEventListener('click', () => {
        const newIndex = initialData.datasets.length;
        const labelsLen = initialData.labels.length;
        const newColor = randomHexColor();
        initialData.datasets.push({
            label: `对比量 ${newIndex + 1}`,
            data: Array.from({ length: labelsLen }, () => Math.floor(Math.random() * 20)),
            backgroundColor: hexToRgba(newColor, 0.7),
            borderColor: hexToRgba(newColor, 1),
            borderWidth: 2,
            type: 'bar',
            yAxisID: 'y',
            linePointStyle: 'circle',
            lineBorderWidth: 2,
            lineFill: false,
            visible: true
        });
        createDatasetControls();
        buildMixedTypeSelectors();
        // 绑定动态生成的 dataset 输入事件
        bindDatasetInputsInstant();
    });

    document.getElementById('remove-dataset').addEventListener('click', () => {
        if (initialData.datasets.length > 1) {
            initialData.datasets.pop();
            createDatasetControls();
            buildMixedTypeSelectors();
            bindDatasetInputsInstant();
        }
    });
    
    document.getElementById('orientation-vertical').addEventListener('click', function () {
        this.classList.add('active');
        document.getElementById('orientation-horizontal').classList.remove('active');
    });

    document.getElementById('orientation-horizontal').addEventListener('click', function () {
        this.classList.add('active');
        document.getElementById('orientation-vertical').classList.remove('active');
    });

    // 主题切换功能
    document.getElementById('theme-light').addEventListener('click', function () {
        this.classList.add('active');
        document.getElementById('theme-dark').classList.remove('active');
        setTheme('light');
    });

    document.getElementById('theme-dark').addEventListener('click', function () {
        this.classList.add('active');
        document.getElementById('theme-light').classList.remove('active');
        setTheme('dark');
    });

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // 更新导出背景色的默认值
        const exportBgInput = document.getElementById('export-bg');
        if (exportBgInput) {
            const newBgColor = theme === 'dark' ? '#2d2d2d' : '#FFFFFF';
            exportBgInput.value = newBgColor;
            
            // 更新画布和SVG的背景色实时预览
            const canvasEl = document.getElementById('myChart');
            const svgEl = document.getElementById('d3Chart');
            if (canvasEl) canvasEl.style.backgroundColor = newBgColor;
            if (svgEl) svgEl.style.backgroundColor = newBgColor;
        }
        
        // 重新渲染图表以适应新主题
        renderChart();
    }

    // 初始化主题
    function initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        if (savedTheme === 'dark') {
            document.getElementById('theme-dark').click();
        }
    }

    // 页面加载完成后初始化主题
    initTheme();

    // Slider labels
    const cutEl = document.getElementById('donut-cutout');
    const cutLabel = document.getElementById('donut-cutout-value');
    cutEl.addEventListener('input', () => { cutLabel.textContent = cutEl.value; });
    
    const binsEl = document.getElementById('hist-bins');
    const binsLabel = document.getElementById('hist-bins-value');
    binsEl.addEventListener('input', () => { binsLabel.textContent = binsEl.value; });
    
    const pieRadiusEl = document.getElementById('pie-radius');
    const pieRadiusLabel = document.getElementById('pie-radius-value');
    if (pieRadiusEl && pieRadiusLabel) {
        pieRadiusEl.addEventListener('input', () => { pieRadiusLabel.textContent = pieRadiusEl.value; });
    }
    
    const areaOpacityEl = document.getElementById('area-opacity');
    const areaOpacityLabel = document.getElementById('area-opacity-value');
    if (areaOpacityEl && areaOpacityLabel) {
        areaOpacityEl.addEventListener('input', () => { areaOpacityLabel.textContent = areaOpacityEl.value; });
    }

    // Export
    document.getElementById('export-scale').addEventListener('input', (e) => {
        document.getElementById('export-scale-value').textContent = e.target.value;
    });
    // 实时预览：背景色输入即时更新到画布与 SVG
    const exportBgInput = document.getElementById('export-bg');
    if (exportBgInput) {
        const applyLiveBackground = (color) => {
            const canvasEl = document.getElementById('myChart');
            const svgEl = document.getElementById('d3Chart');
            if (canvasEl) canvasEl.style.backgroundColor = color;
            if (svgEl) svgEl.style.backgroundColor = color;
        };
        // 初始化同步一次
        applyLiveBackground(exportBgInput.value || '#FFFFFF');
        // 即时响应
        exportBgInput.addEventListener('input', (e) => applyLiveBackground(e.target.value));
        exportBgInput.addEventListener('change', (e) => applyLiveBackground(e.target.value));
    }

    document.getElementById('export-image').addEventListener('click', () => {
        const type = document.getElementById('export-type').value;
        const scale = parseInt(document.getElementById('export-scale').value, 10) || 2;
        const bg = document.getElementById('export-bg').value || '#FFFFFF';
        exportImage(type, scale, bg);
    });

    // --- Utils ---
    function debounce(fn, delay) {
        let t;
        return function() {
            clearTimeout(t);
            t = setTimeout(() => fn(), delay);
        }
    }

    // 互换按钮
    document.getElementById('axis-swap-btn').addEventListener('click', () => {
        swapAxisTitles();
        updateChartSettings();
    });

    function swapAxisTitles() {
        const xEl = document.getElementById('x-axis-title');
        const yEl = document.getElementById('y-axis-left-title');
        const tmp = xEl.value;
        xEl.value = yEl.value;
        yEl.value = tmp;
    }

    // 当方向切换时，若用户希望保持“屏幕水平为 X、屏幕垂直为 Y”的含义，可自动交换
    function maybeSwapAxisOnOrientation(targetIndexAxis) {
        // indexAxis 为 'x' 表竖向（类别在 X），'y' 表横向（类别在 Y）
        // 如果切换导致类别轴从 X -> Y 或 Y -> X，我们交换标题以符合直觉
        const isHorizontal = (targetIndexAxis === 'y');
        // 仅在折线/柱/面积/混合等有坐标的图形中自动交换
        const t = document.getElementById('chart-type').value;
        if (['bar','bar-stacked','line','area','area-stacked','bar-line','histogram'].includes(t)) {
            swapAxisTitles();
        }
    }

    function hexToRgba(hex, alpha) {
        if (!hex) return `rgba(0,0,0,${alpha || 1})`;
        let r = 0, g = 0, b = 0;
        if (hex.length === 4) {
            r = parseInt(hex[1] + hex[1], 16);
            g = parseInt(hex[2] + hex[2], 16);
            b = parseInt(hex[3] + hex[3], 16);
        } else if (hex.length === 7) {
            r = parseInt(hex.slice(1, 3), 16);
            g = parseInt(hex.slice(3, 5), 16);
            b = parseInt(hex.slice(5, 7), 16);
        }
        return `rgba(${r},${g},${b},${alpha != null ? alpha : 1})`;
    }

    function applyAxisTitles(options) {
        const xTitle = document.getElementById('x-axis-title').value || '';
        const yLeft = document.getElementById('y-axis-left-title').value || '';
        const yRight = document.getElementById('y-axis-right-title').value || '';
        options.scales = options.scales || {};
        options.scales.x = options.scales.x || {};
        options.scales.y = options.scales.y || {};
        options.scales.x.title = { display: !!xTitle, text: xTitle };
        options.scales.y.title = { display: !!yLeft, text: yLeft };
        // 右轴仅在需要时添加（示意：当存在名为 '右轴' 的数据集或用户填写标题时）
        if (yRight) {
            options.scales.y1 = options.scales.y1 || { position: 'right', grid: { drawOnChartArea: false } };
            options.scales.y1.title = { display: true, text: yRight };
        } else if (options.scales.y1) {
            delete options.scales.y1; // 清理右轴
        }
    }

    function rgbaToHex(rgba) {
        if (!rgba) return '#000000';
        try {
            const parts = rgba.substring(rgba.indexOf('(') + 1, rgba.indexOf(')')).split(',');
            const r = parseInt(parts[0].trim(), 10) || 0;
            const g = parseInt(parts[1].trim(), 10) || 0;
            const b = parseInt(parts[2].trim(), 10) || 0;
            return '#' + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1).toUpperCase();
        } catch (e) {
            return '#000000';
        }
    }

    function colorToHex(color) {
        if (!color) return null;
        if (color.startsWith('#')) return color;
        if (color.startsWith('rgba') || color.startsWith('rgb')) return rgbaToHex(color);
        return null;
    }

    function adjustAlpha(rgba, alpha) {
        const hex = rgbaToHex(rgba);
        return hexToRgba(hex, alpha);
    }

    function parseCSVNumbers(str) {
        return (str || '')
            .split(/[,，]/)
            .map(s => Number(String(s).trim()))
            .map(v => (isFinite(v) ? v : 0));
    }

    function normalizeArrayLength(arr, targetLen) {
        const a = Array.from(arr || []);
        if (a.length > targetLen) return a.slice(0, targetLen);
        while (a.length < targetLen) a.push(0);
        return a;
    }

    function randomHexColor() {
        const n = Math.floor(Math.random() * 0xffffff);
        return '#' + n.toString(16).padStart(6, '0');
    }

    function generateSegmentColors(baseRgba, n) {
        const hex = rgbaToHex(baseRgba) || '#888888';
        const base = d3.color(hex);
        const colors = [];
        for (let i = 0; i < n; i++) {
            const t = n <= 1 ? 0.5 : i / (n - 1);
            const c = d3.interpolateRgb(base.brighter(1.2), base.darker(0.5))(t);
            colors.push(d3.color(c).formatHex());
        }
        return colors;
    }

    function computeHistogram(values, binsCount) {
        const arr = (values || []).map(v => Number(v) || 0);
        const min = Math.min(...arr);
        const max = Math.max(...arr);
        const bins = Math.max(1, binsCount || 10);
        const step = (max - min) / bins || 1;
        const counts = new Array(bins).fill(0);
        arr.forEach(v => {
            let idx = Math.floor((v - min) / step);
            if (idx >= bins) idx = bins - 1;
            if (idx < 0) idx = 0;
            counts[idx]++;
        });
        const labels = counts.map((_, i) => {
            const a = (min + i * step);
            const b = (min + (i + 1) * step);
            return `${formatNumber(a)} - ${formatNumber(b)}`;
        });
        return { binLabels: labels, binValues: counts };
    }

    function formatNumber(n) {
        if (Math.abs(n) >= 1000 || Math.abs(n) < 0.01) return n.toExponential(2);
        return Number(n.toFixed(2));
    }

    // --- Init ---
    document.getElementById('labels-input').value = initialData.labels.join(', ');
    createDatasetControls();
    bindDatasetInputsInstant();
    refreshSingleSeriesOptions();
    buildMixedTypeSelectors();
    renderChart();
    // 防御：若首次渲染因浏览器布局时机未完成导致未显示，稍后重试一次
    setTimeout(() => {
        const dc = document.getElementById('dataset-container');
        if (dc && dc.children.length === 0) {
    createDatasetControls();
            bindDatasetInputsInstant();
            buildMixedTypeSelectors();
        }
        if (!myChart) {
    renderChart();
        }
    }, 0);

    // --- Palettes & Export helpers ---
    function getPalettes() {
        return {
            bright: ['#FF6B6B', '#4ECDC4', '#FFD166', '#45B7D1', '#A78BFA', '#00C49A'],
            pastel: ['#FFC8A2', '#A0E7E5', '#B4F8C8', '#FBE7C6', '#C3B1E1', '#FFD6E0'],
            ocean: ['#004E92', '#00A8C5', '#70E1F5', '#28CC9E', '#045DE9', '#00C6FB'],
            sunset: ['#FF9A8B', '#FF6A88', '#FF99AC', '#F6D365', '#FDA085', '#F5576C'],
            mint: ['#00C9A7', '#92FE9D', '#00DBDE', '#4BE1EC', '#7EE8FA', '#E0FFB3'],
            warm: ['#E67E22', '#E74C3C', '#D35400', '#F39C12', '#C0392B', '#F1C40F'],
            cool: ['#2980B9', '#16A085', '#1ABC9C', '#2ECC71', '#3498DB', '#9B59B6']
        };
    }

    function getPaletteColorsForCount(scheme, n) {
        const out = [];
        for (let i = 0; i < n; i++) {
            out.push(scheme[i % scheme.length]);
        }
        return out;
    }

    function exportImage(type, scale, bgColor) {
        const chartType = document.getElementById('chart-type').value;
        const usingD3 = (chartType === 'streamgraph' || chartType === 'treemap');
        if (type === 'svg') {
            if (!usingD3) {
                alert('当前图表为 Canvas 渲染，建议使用 PNG 导出。');
                return;
            }
            const serializer = new XMLSerializer();
            const cloned = svg.cloneNode(true);
            // Inject background rect
            const { width, height } = svg.getBoundingClientRect();
            const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            bgRect.setAttribute('width', width);
            bgRect.setAttribute('height', height);
            bgRect.setAttribute('fill', bgColor);
            cloned.insertBefore(bgRect, cloned.firstChild);
            
            // 为矩形树图添加系列名称标注
            if (chartType === 'treemap') {
                const seriesIdx = parseInt(document.getElementById('single-series-select').value || '0', 10) || 0;
                const seriesName = initialData.datasets[seriesIdx]?.label || '数据系列';
                
                const seriesLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                seriesLabel.setAttribute('x', width / 2);
                seriesLabel.setAttribute('y', height - 10);
                seriesLabel.setAttribute('text-anchor', 'middle');
                seriesLabel.setAttribute('fill', '#666');
                seriesLabel.setAttribute('font-size', '14');
                seriesLabel.setAttribute('font-weight', '500');
                seriesLabel.textContent = `数据系列：${seriesName}`;
                cloned.appendChild(seriesLabel);
            }
            
            const source = serializer.serializeToString(cloned);
            const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            triggerDownload(url, `chart-${Date.now()}.svg`);
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            return;
        }

        // PNG export
        if (usingD3) {
            // Render SVG → Canvas → PNG
            const serializer = new XMLSerializer();
            const clonedForPNG = svg.cloneNode(true);
            
            // 为矩形树图PNG导出添加系列名称标注
            if (chartType === 'treemap') {
                const seriesIdx = parseInt(document.getElementById('single-series-select').value || '0', 10) || 0;
                const seriesName = initialData.datasets[seriesIdx]?.label || '数据系列';
                const { width, height } = svg.getBoundingClientRect();
                
                const seriesLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                seriesLabel.setAttribute('x', width / 2);
                seriesLabel.setAttribute('y', height - 10);
                seriesLabel.setAttribute('text-anchor', 'middle');
                seriesLabel.setAttribute('fill', '#666');
                seriesLabel.setAttribute('font-size', '14');
                seriesLabel.setAttribute('font-weight', '500');
                seriesLabel.textContent = `数据系列：${seriesName}`;
                clonedForPNG.appendChild(seriesLabel);
            }
            
            const source = serializer.serializeToString(clonedForPNG);
            const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);
            const img = new Image();
            const { width, height } = svg.getBoundingClientRect();
            img.onload = function () {
                const canvas = document.createElement('canvas');
                canvas.width = Math.floor(width * scale);
                canvas.height = Math.floor(height * scale);
                const ctx2 = canvas.getContext('2d');
                // Background
                ctx2.fillStyle = bgColor;
                ctx2.fillRect(0, 0, canvas.width, canvas.height);
                // Draw svg image
                ctx2.drawImage(img, 0, 0, canvas.width, canvas.height);
                URL.revokeObjectURL(url);
                canvas.toBlob((blob) => {
                    const pngUrl = URL.createObjectURL(blob);
                    triggerDownload(pngUrl, `chart-${Date.now()}@${scale}x.png`);
                    setTimeout(() => URL.revokeObjectURL(pngUrl), 1000);
                });
            };
            img.src = url;
        } else {
            // Chart.js canvas to PNG at scale
            const canvas = document.createElement('canvas');
            const srcCanvas = document.getElementById('myChart');
            const rect = srcCanvas.getBoundingClientRect();
            canvas.width = Math.floor(rect.width * scale);
            canvas.height = Math.floor(rect.height * scale);
            const ctx2 = canvas.getContext('2d');
            // Background
            ctx2.fillStyle = bgColor;
            ctx2.fillRect(0, 0, canvas.width, canvas.height);
            // Draw current chart onto temp canvas by scaling
            ctx2.drawImage(srcCanvas, 0, 0, canvas.width, canvas.height);
            
            // 为需要单系列选择的图表添加系列名称标注
            if (chartType === 'pie' || chartType === 'donut' || chartType === 'histogram') {
                const seriesIdx = parseInt(document.getElementById('single-series-select').value || '0', 10) || 0;
                const seriesName = initialData.datasets[seriesIdx]?.label || '数据系列';
                
                // 在canvas底部绘制系列标注
                ctx2.save();
                ctx2.font = `${14 * scale}px Arial`;
                ctx2.fillStyle = '#666';
                ctx2.textAlign = 'center';
                ctx2.textBaseline = 'bottom';
                
                const labelText = `数据系列：${seriesName}`;
                const labelX = canvas.width / 2;
                const labelY = canvas.height - (10 * scale);
                
                // 添加白色背景提高可读性
                const textWidth = ctx2.measureText(labelText).width;
                const textHeight = 14 * scale;
                const padding = 4 * scale;
                
                ctx2.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx2.fillRect(labelX - textWidth/2 - padding, labelY - textHeight - padding, 
                             textWidth + padding * 2, textHeight + padding * 2);
                
                // 绘制文字
                ctx2.fillStyle = '#666';
                ctx2.fillText(labelText, labelX, labelY);
                ctx2.restore();
            }
            
            canvas.toBlob((blob) => {
                const pngUrl = URL.createObjectURL(blob);
                triggerDownload(pngUrl, `chart-${Date.now()}@${scale}x.png`);
                setTimeout(() => URL.revokeObjectURL(pngUrl), 1000);
            });
        }
    }

    function triggerDownload(url, filename) {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
});


