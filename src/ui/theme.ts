/// <reference path="../app.state.ts" />
/// <reference path="../utils/color.ts" />
/// <reference path="../utils/dom.ts" />
/// <reference path="../renderers/chartjs.ts" />
namespace App.UI.Theme {
    export function applyThemeBackground(): void {
        const defaultColor = App.Utils.Color.normalizeColorToHex(App.Utils.DOM.getCanvasBackgroundColor());
        App.DOM.exportBg.value = defaultColor;
    }

    export function applyLightTheme(): void {
        document.documentElement.setAttribute('data-theme', 'light');
        App.DOM.themeLight.classList.add('active');
        App.DOM.themeDark.classList.remove('active');
        applyThemeBackground();
        App.Renderers.ChartJS.renderChart();
        setTimeout(() => {
            document.body.classList.remove('theme-switching');
        }, 400);
    }

    export function applyDarkTheme(): void {
        document.documentElement.setAttribute('data-theme', 'dark');
        App.DOM.themeDark.classList.add('active');
        App.DOM.themeLight.classList.remove('active');
        applyThemeBackground();
        App.Renderers.ChartJS.renderChart();
        setTimeout(() => {
            document.body.classList.remove('theme-switching');
        }, 400);
    }
}
