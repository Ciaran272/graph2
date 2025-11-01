/// <reference path="./app.types.ts" />
/// <reference path="./app.constants.ts" />
namespace App {
    declare const Chart: any;
    declare const d3: any;

    export let currentPaletteKey: PaletteKey = 'bright';
    export let orientation: ChartOrientation = 'x';
    export let myChart: any = null;

    export interface DOMCache {
        chartType: HTMLSelectElement;
        chartTitle: HTMLInputElement;
        orientationVertical: HTMLButtonElement;
        orientationHorizontal: HTMLButtonElement;
        labelsInput: HTMLTextAreaElement;
        paletteSelect: HTMLSelectElement;
        exportBg: HTMLInputElement;
        datasetContainer: HTMLDivElement;
        addDataset: HTMLButtonElement;
        removeDataset: HTMLButtonElement;
        themeLight: HTMLButtonElement;
        themeDark: HTMLButtonElement;
        axisSwapBtn: HTMLButtonElement | null;
        xAxisTitle: HTMLInputElement | null;
        yAxisLeftTitle: HTMLInputElement | null;
        yAxisRightTitle: HTMLInputElement | null;
        donutCutout: HTMLInputElement;
        donutCutoutValue: HTMLSpanElement;
        pieRadius: HTMLInputElement;
        pieRadiusValue: HTMLSpanElement;
        areaOpacity: HTMLInputElement;
        areaOpacityValue: HTMLSpanElement;
        histBins: HTMLInputElement;
        histBinsValue: HTMLSpanElement;
        bubbleUseCustomXY: HTMLInputElement | null;
        bubbleXData: HTMLTextAreaElement | null;
        bubbleYData: HTMLTextAreaElement | null;
        exportScale: HTMLInputElement;
        exportScaleValue: HTMLSpanElement;
        exportType: HTMLSelectElement;
        exportButton: HTMLButtonElement;
        resetDashboard: HTMLButtonElement;
    }

    export interface ElementCache {
        canvas: HTMLCanvasElement;
        ctx: CanvasRenderingContext2D;
        svg: SVGSVGElement;
    }

    export let DOM: DOMCache;
    export let Elements: ElementCache;

    export const defaultState: ChartData = {
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

    export const cloneState = <T>(source: T): T => {
        if (typeof structuredClone === 'function') {
            return structuredClone(source);
        }
        return JSON.parse(JSON.stringify(source)) as T;
    };

    export let initialData: ChartData = cloneState(defaultState);

    export function initializeState(): void {
        if (DOM && Elements) {
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

        Elements = {
            canvas: canvasNode,
            ctx: canvasNode.getContext('2d') as CanvasRenderingContext2D,
            svg: svgNode
        };

        DOM = {
            chartType: document.getElementById('chart-type') as HTMLSelectElement,
            chartTitle: document.getElementById('chart-title') as HTMLInputElement,
            orientationVertical: document.getElementById('orientation-vertical') as HTMLButtonElement,
            orientationHorizontal: document.getElementById('orientation-horizontal') as HTMLButtonElement,
            labelsInput: document.getElementById('labels-input') as HTMLTextAreaElement,
            paletteSelect: document.getElementById('palette-select') as HTMLSelectElement,
            exportBg: document.getElementById('export-bg') as HTMLInputElement,
            datasetContainer: document.getElementById('dataset-container') as HTMLDivElement,
            addDataset: document.getElementById('add-dataset') as HTMLButtonElement,
            removeDataset: document.getElementById('remove-dataset') as HTMLButtonElement,
            themeLight: document.getElementById('theme-light') as HTMLButtonElement,
            themeDark: document.getElementById('theme-dark') as HTMLButtonElement,
            axisSwapBtn: document.getElementById('axis-swap-btn') as HTMLButtonElement | null,
            xAxisTitle: document.getElementById('x-axis-title') as HTMLInputElement | null,
            yAxisLeftTitle: document.getElementById('y-axis-left-title') as HTMLInputElement | null,
            yAxisRightTitle: document.getElementById('y-axis-right-title') as HTMLInputElement | null,
            donutCutout: document.getElementById('donut-cutout') as HTMLInputElement,
            donutCutoutValue: document.getElementById('donut-cutout-value') as HTMLSpanElement,
            pieRadius: document.getElementById('pie-radius') as HTMLInputElement,
            pieRadiusValue: document.getElementById('pie-radius-value') as HTMLSpanElement,
            areaOpacity: document.getElementById('area-opacity') as HTMLInputElement,
            areaOpacityValue: document.getElementById('area-opacity-value') as HTMLSpanElement,
            histBins: document.getElementById('hist-bins') as HTMLInputElement,
            histBinsValue: document.getElementById('hist-bins-value') as HTMLSpanElement,
            bubbleUseCustomXY: document.getElementById('bubble-use-custom-xy') as HTMLInputElement | null,
            bubbleXData: document.getElementById('bubble-x-data') as HTMLTextAreaElement | null,
            bubbleYData: document.getElementById('bubble-y-data') as HTMLTextAreaElement | null,
            exportScale: document.getElementById('export-scale') as HTMLInputElement,
            exportScaleValue: document.getElementById('export-scale-value') as HTMLSpanElement,
            exportType: document.getElementById('export-type') as HTMLSelectElement,
            exportButton: document.getElementById('export-image') as HTMLButtonElement,
            resetDashboard: document.getElementById('reset-dashboard') as HTMLButtonElement
        };
    }
}
