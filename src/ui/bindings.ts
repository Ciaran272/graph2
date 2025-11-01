/// <reference path="../app.types.ts" />
/// <reference path="../app.state.ts" />
/// <reference path="../app.constants.ts" />
/// <reference path="../utils/helpers.ts" />
/// <reference path="../utils/color.ts" />
/// <reference path="../utils/data.ts" />
/// <reference path="../renderers/chartjs.ts" />
/// <reference path="./controls.ts" />
/// <reference path="./visibility.ts" />
namespace App.UI.Bindings {
    const debounceFastRender = App.Utils.Helpers.debounce(App.Renderers.ChartJS.renderChart, 100);

    export function bindDatasetContainer(): void {
        const container = App.DOM.datasetContainer;
        if (!container) return;

        container.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            if (target && target.matches('[id^="dataset-name-done-"]')) {
                const index = parseInt(target.id.replace('dataset-name-done-', ''), 10);
                const nameInput = document.getElementById(`dataset-name-${index}`) as HTMLInputElement;
                if (nameInput && App.initialData.datasets[index]) {
                    App.initialData.datasets[index].label = nameInput.value;
                    App.UI.Visibility.refreshSingleSeriesOptions();
                    App.Renderers.ChartJS.renderChart();
                    App.Utils.Helpers.showSuccessFeedback(target);
                }
            }
        });

        container.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
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
            const target = e.target as HTMLInputElement;
            if (target && target.matches('[id^="dataset-right-"]')) {
                const index = parseInt(target.id.replace('dataset-right-', ''), 10);
                if (App.initialData.datasets[index]) {
                    App.initialData.datasets[index].yAxisID = target.checked ? 'y1' : 'y';
                    App.Renderers.ChartJS.renderChart();
                }
            } else if (target && target.matches('[id^="dataset-visible-"]')) {
                const index = parseInt(target.id.replace('dataset-visible-', ''), 10);
                if (App.initialData.datasets[index]) {
                    App.initialData.datasets[index].visible = target.checked;
                    App.UI.Visibility.refreshSingleSeriesOptions();
                    App.Renderers.ChartJS.renderChart();
                }
            }
        });

        container.addEventListener('blur', (e) => {
            const target = e.target as HTMLTextAreaElement | HTMLInputElement;
            if (target && target.matches('[id^="dataset-data-"]')) {
                const index = parseInt(target.id.replace('dataset-data-', ''), 10);
                if (App.initialData.datasets[index]) {
                    const parsed = App.Utils.Data.parseDatasetValues(
                        target.value,
                        App.initialData.labels.length
                    );
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

    export function bindGlobalControls(): void {
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
                const target = e.target as HTMLInputElement;
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
                const target = e.target as HTMLInputElement;
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
                const target = e.target as HTMLInputElement;
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
                const target = e.target as HTMLInputElement;
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
                const type = (App.DOM.exportType ? App.DOM.exportType.value : 'png') as ExportFormat;
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
            const nextType = App.DOM.chartType.value as ChartType;
            if (isFirstRender) {
                isFirstRender = false;
                triggerRender();
                App.UI.Visibility.updateControlVisibility(nextType);
                if (nextType === 'bar-line') {
                    App.UI.Controls.buildMixedTypeSelectors();
                }
            } else {
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
            const target = e.target as HTMLSelectElement;
            App.Renderers.ChartJS.applyPalette(target.value as PaletteKey);
            App.UI.Controls.createDatasetControls();
            App.UI.Visibility.refreshSingleSeriesOptions();
            triggerRender();
        });

        App.DOM.exportBg.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
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
            } else {
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
}
