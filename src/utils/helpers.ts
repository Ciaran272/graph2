/// <reference path="../app.state.ts" />
/// <reference path="./color.ts" />
/// <reference path="./dom.ts" />
namespace App.Utils.Helpers {
    export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void {
        let timer: ReturnType<typeof setTimeout> | null = null;
        return function (this: any, ...args: Parameters<T>): void {
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    export function showSuccessFeedback(element: HTMLElement | null, duration: number = 600): void {
        if (!element) return;
        element.classList.add('success');
        setTimeout(() => element.classList.remove('success'), duration);
    }

    export function triggerDownload(url: string, filename: string): void {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    export function unwrap<T>(value: T | null | undefined, message: string): T {
        if (value === null || value === undefined) {
            throw new Error(message);
        }
        return value;
    }
}

namespace App {
    export const Theme = {
        isDarkTheme(): boolean {
            return document.documentElement.getAttribute('data-theme') === 'dark';
        },
        getThemeTextColor(): string {
            return this.isDarkTheme() ? '#E8E8EA' : '#1f1a10';
        },
        getThemeGridColor(): string {
            return this.isDarkTheme() ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
        }
    };
}
