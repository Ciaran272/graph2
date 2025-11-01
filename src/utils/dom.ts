/// <reference path="../app.types.ts" />
/// <reference path="../app.state.ts" />
namespace App.Utils.DOM {
    export function getCanvasBackgroundColor(): string {
        const style = getComputedStyle(document.documentElement);
        const chartBg = style.getPropertyValue('--chart-bg').trim();
        if (chartBg) return chartBg;
        const chartWrap = document.querySelector('.chart-wrap');
        if (chartWrap) {
            return getComputedStyle(chartWrap).backgroundColor;
        }
        return '#FFFFFF';
    }

    export function prepareSVG(svg: SVGSVGElement, canvas: HTMLCanvasElement): void {
        while (svg.firstChild) {
            svg.removeChild(svg.firstChild);
        }
        svg.classList.remove('hidden');
        canvas.classList.add('hidden');
        svg.style.display = '';
        svg.style.visibility = '';
        svg.style.opacity = '';
        canvas.style.display = '';
        canvas.style.visibility = '';
        canvas.style.opacity = '';
    }

    export function prepareCanvas(svg: SVGSVGElement, canvas: HTMLCanvasElement): void {
        svg.classList.add('hidden');
        canvas.classList.remove('hidden');
        svg.style.display = '';
        svg.style.visibility = '';
        svg.style.opacity = '';
        canvas.style.display = '';
        canvas.style.visibility = '';
        canvas.style.opacity = '';
    }

    export function sizeSVG(svg: SVGSVGElement): { width: number; height: number } {
        const rect = svg.getBoundingClientRect();
        const width = rect.width || svg.clientWidth || 800;
        const height = rect.height || svg.clientHeight || 400;
        svg.setAttribute('width', String(width));
        svg.setAttribute('height', String(height));
        return { width, height };
    }

    export function addSVGTitles(svg: SVGSVGElement, title: string, width: number, height: number): void {
        const existingTitle = svg.querySelector('title');
        if (existingTitle) {
            existingTitle.textContent = title;
        } else {
            const titleEl = document.createElementNS('http://www.w3.org/2000/svg', 'title');
            titleEl.textContent = title;
            svg.insertBefore(titleEl, svg.firstChild);
        }

        const metaId = 'chart-meta-info';
        let metaGroup = svg.querySelector(`#${metaId}`) as SVGGElement | null;
        if (!metaGroup) {
            metaGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            metaGroup.setAttribute('id', metaId);
            svg.appendChild(metaGroup);
        }

        metaGroup.innerHTML = '';

        const titleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        titleText.textContent = title;
        titleText.setAttribute('x', String(width / 2));
        titleText.setAttribute('y', '28');
        titleText.setAttribute('fill', App.Theme.getThemeTextColor());
        titleText.setAttribute('font-size', '18');
        titleText.setAttribute('font-weight', '600');
        titleText.setAttribute('text-anchor', 'middle');
        metaGroup.appendChild(titleText);

        // 原版不会追加导出时间戳，这里保持标题即可
    }
}
