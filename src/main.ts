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
namespace App {
    document.addEventListener('DOMContentLoaded', () => {
        try {
            App.initializeState();
            App.Renderers.ChartJS.applyPalette(App.currentPaletteKey);
            App.UI.Theme.applyThemeBackground();
            App.UI.Visibility.refreshSingleSeriesOptions();
            App.UI.Controls.createDatasetControls();
            App.UI.Visibility.updateControlVisibility(App.DOM.chartType.value as ChartType);
            App.UI.Bindings.bindDatasetContainer();
            App.UI.Bindings.bindGlobalControls();
            App.Renderers.ChartJS.renderChart();
            App.DOM.resetDashboard.addEventListener('click', () => {
                App.State.restoreDefaults();
                App.UI.Motion.showSuccessFeedback?.(App.DOM.resetDashboard);
            });
        } catch (error) {
            console.error('应用初始化失败:', error);
            alert('初始化应用时出现问题，请刷新页面重试。');
        }
    });
}
