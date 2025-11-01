/// <reference path="../renderers/chartjs.ts" />
namespace App.UI.Motion {
    export function animateChartTransition(callback: () => void): void {
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

    export function showSuccessFeedback(element: HTMLElement | null, duration: number = 600): void {
        if (!element) return;
        element.classList.add('success');
        setTimeout(() => element.classList.remove('success'), duration);
    }
}
