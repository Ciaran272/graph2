/// <reference path="../app.types.ts" />
/// <reference path="../app.constants.ts" />
/// <reference path="../app.state.ts" />
/// <reference path="../utils/color.ts" />
/// <reference path="../utils/dom.ts" />
/// <reference path="../utils/helpers.ts" />
/// <reference path="../renderers/d3.ts" />
namespace App.Export {
    function exportCanvasToPNG(scale: number, bgColor: string): void {
        if (!App.myChart) {
            alert('当前没有可导出的图表');
            return;
        }
        const sourceCanvas = App.myChart.canvas as HTMLCanvasElement;
        const width = sourceCanvas.width;
        const height = sourceCanvas.height;
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = Math.max(1, Math.round(width * scale));
        exportCanvas.height = Math.max(1, Math.round(height * scale));
        const exportCtx = exportCanvas.getContext('2d');
        if (!exportCtx) {
            alert('导出失败：无法获取 Canvas 上下文');
            return;
        }
        exportCtx.fillStyle = bgColor;
        exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
        exportCtx.drawImage(sourceCanvas, 0, 0, exportCanvas.width, exportCanvas.height);
        const dataURL = exportCanvas.toDataURL('image/png');
        App.Utils.Helpers.triggerDownload(dataURL, `chart-${Date.now()}.png`);
    }

    function exportSVGToPNG(scale: number, bgColor: string): void {
        const svgEl = App.Elements.svg;
        if (!svgEl || svgEl.classList.contains('hidden')) {
            alert('当前没有可导出的SVG图表');
            return;
        }
        try {
            const svgRect = svgEl.getBoundingClientRect();
            const width = svgRect.width;
            const height = svgRect.height;
            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, Math.round(width * scale));
            canvas.height = Math.max(1, Math.round(height * scale));
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                alert('导出失败：无法创建 Canvas 渲染上下文');
                return;
            }
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            const serializer = new XMLSerializer();
            let svgStr = serializer.serializeToString(svgEl);
            const img = new Image();
            const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);
            img.onload = function () {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const dataURL = canvas.toDataURL('image/png');
                App.Utils.Helpers.triggerDownload(dataURL, `chart-${Date.now()}.png`);
                URL.revokeObjectURL(url);
            };
            img.onerror = function () {
                alert('SVG转PNG失败，请尝试导出SVG格式');
                URL.revokeObjectURL(url);
            };
            img.src = url;
        } catch (error: any) {
            console.error('SVG导出失败:', error);
            alert('SVG导出失败: ' + (error?.message || error));
        }
    }

    function exportSVGToFile(): void {
        const svgEl = App.Elements.svg;
        if (!svgEl || svgEl.classList.contains('hidden')) {
            alert('当前图表不支持SVG导出，请选择PNG格式');
            return;
        }
        const serializer = new XMLSerializer();
        let svgStr = serializer.serializeToString(svgEl);
        svgStr = '<?xml version="1.0" standalone="no"?>\r\n' + svgStr;
        const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        App.Utils.Helpers.triggerDownload(url, `chart-${Date.now()}.svg`);
        URL.revokeObjectURL(url);
    }

    export function exportChartImage(type: ExportFormat, scale: number, bgColor: string): void {
        try {
            const normalizedScale = Number.isFinite(scale) ? Math.max(1, Math.min(10, scale)) : 1;
            const normalizedBg = App.Utils.Color.normalizeColorToHex(bgColor) || '#FFFFFF';
            const svgEl = document.getElementById('d3Chart');
            const isSVGChart = svgEl && !svgEl.classList.contains('hidden');
            if (type === 'svg') {
                if (isSVGChart) {
                    exportSVGToFile();
                } else {
                    alert('当前图表不支持SVG导出，请选择PNG格式');
                }
            } else {
                if (isSVGChart) {
                    exportSVGToPNG(normalizedScale, normalizedBg);
                } else {
                    exportCanvasToPNG(normalizedScale, normalizedBg);
                }
            }
        } catch (error) {
            console.error('导出失败:', error);
            alert('导出图片时出现错误，请稍后重试。');
        }
    }
}
