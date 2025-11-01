namespace App {
    export type ChartType =
        | 'bar'
        | 'bar-stacked'
        | 'bar-horizontal'
        | 'line'
        | 'area'
        | 'area-stacked'
        | 'pie'
        | 'donut'
        | 'histogram'
        | 'radar'
        | 'bar-line'
        | 'bubble'
        | 'streamgraph'
        | 'treemap';
    export type PaletteKey =
        | 'bright'
        | 'pastel'
        | 'ocean'
        | 'sunset'
        | 'mint'
        | 'warm'
        | 'cool';
    export type ExportFormat = 'png' | 'svg';
    export type ChartOrientation = 'x' | 'y';
    export interface ChartData {
        labels: string[];
        datasets: any[];
    }
}
