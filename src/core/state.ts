/// <reference path="../app.state.ts" />
/// <reference path="../app.constants.ts" />
/// <reference path="../utils/color.ts" />
/// <reference path="../utils/dom.ts" />
/// <reference path="../utils/helpers.ts" />
/// <reference path="../ui/controls.ts" />
/// <reference path="../ui/visibility.ts" />
/// <reference path="../renderers/chartjs.ts" />
/// <reference path="../ui/theme.ts" />
namespace App.State {
    export function restoreDefaults(): void {
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
}
