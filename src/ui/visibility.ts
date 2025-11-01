/// <reference path="../app.types.ts" />
/// <reference path="../app.constants.ts" />
/// <reference path="../app.state.ts" />
/// <reference path="../utils/helpers.ts" />
namespace App.UI.Visibility {
    export function refreshSingleSeriesOptions(): void {
        const select = document.getElementById('single-series-select') as HTMLSelectElement;
        if (!select) return;
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

    export function updateControlVisibility(chartType: ChartType): void {
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
        } else {
            const mixedContainer = document.getElementById('mixed-types-container');
            if (mixedContainer) {
                mixedContainer.innerHTML = '';
            }
        }
    }

    export function updateSeriesNote(seriesName: string): void {
        const note = document.getElementById('chart-selected-label');
        if (!note) return;
        if (seriesName) {
            note.textContent = `当前系列：${seriesName}`;
            note.classList.remove('hidden');
        } else {
            note.textContent = '';
            note.classList.add('hidden');
        }
    }

    function toggle(element: HTMLElement | null | undefined, visible: boolean): void {
        if (!element) return;
        element.classList.toggle('hidden', !visible);
    }
}
