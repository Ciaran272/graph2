/// <reference path="../app.types.ts" />
/// <reference path="../app.state.ts" />
/// <reference path="../utils/color.ts" />
/// <reference path="../utils/data.ts" />
/// <reference path="./visibility.ts" />
namespace App.UI.Controls {
    export let __isRebuildingMixedSelectors = false;
    export function createDatasetControls(): void {
        const container = document.getElementById('dataset-container');
        if (!container) return;
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

    export function buildMixedTypeSelectors(): void {
        const container = document.getElementById('mixed-types-container');
        if (__isRebuildingMixedSelectors || !container) {
            return;
        }
        __isRebuildingMixedSelectors = true;
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
                if (!target) return;
                const value = (event.target as HTMLSelectElement).value;
                target.type = value;
                if (value === 'bar') {
                    target.linePointStyle = undefined;
                    target.pointStyle = undefined;
                    target.lineBorderWidth = undefined;
                    target.pointRadius = undefined;
                    target.pointHoverRadius = undefined;
                } else {
                    if (!target.linePointStyle) target.linePointStyle = 'circle';
                    if (!target.pointStyle) target.pointStyle = target.linePointStyle;
                    if (typeof target.lineBorderWidth !== 'number') target.lineBorderWidth = target.borderWidth || 2;
                    if (typeof target.pointRadius !== 'number') target.pointRadius = 4;
                    if (typeof target.pointHoverRadius !== 'number') target.pointHoverRadius = Math.min(target.pointRadius + 2, 12);
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
                    if (!target) return;
                    const value = (event.target as HTMLSelectElement).value;
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
                    if (!target) return;
                    let value = Number((event.target as HTMLInputElement).value);
                    if (!Number.isFinite(value)) value = 2;
                    value = Math.min(10, Math.max(1, value));
                    target.lineBorderWidth = value;
                    target.borderWidth = value;
                    (event.target as HTMLInputElement).value = String(value);
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
                    if (!target) return;
                    let value = Number((event.target as HTMLInputElement).value);
                    if (!Number.isFinite(value)) value = 4;
                    value = Math.min(12, Math.max(1, value));
                    target.pointRadius = value;
                    target.pointHoverRadius = Math.min(value + 2, 14);
                    (event.target as HTMLInputElement).value = String(value);
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
        __isRebuildingMixedSelectors = false;
    }
}
