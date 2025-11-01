/// <reference path="../app.types.ts" />
namespace App.Utils.Color {
    export function normalizeColorToHex(color: string): string {
        try {
            if (!color || typeof color !== 'string') return '#FFFFFF';
            if (color.startsWith('#')) return color.toUpperCase();
            const match = color.match(/rgba?\(([^)]+)\)/);
            if (match) {
                const parts = match[1].split(',').map(part => parseFloat(part.trim()));
                const [r, g, b] = parts;
                if (!Number.isFinite(r) || !Number.isFinite(g) || !Number.isFinite(b)) {
                    return '#FFFFFF';
                }
                const toHex = (value: number) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, '0');
                return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
            }
            return color;
        } catch (error) {
            console.error('颜色转换失败:', error);
            return '#FFFFFF';
        }
    }

    export function hexToRgba(hex: string, alpha: number): string {
        try {
            if (!hex || typeof hex !== 'string') return `rgba(255,255,255,${alpha})`;
            if (hex.startsWith('rgba')) return adjustRgbaAlpha(hex, alpha);
            const cleaned = hex.replace('#', '');
            const bigint = parseInt(cleaned, 16);
            if (isNaN(bigint)) return `rgba(255,255,255,${alpha})`;
            const r = (bigint >> 16) & 255;
            const g = (bigint >> 8) & 255;
            const b = bigint & 255;
            return `rgba(${r},${g},${b},${alpha})`;
        } catch (error) {
            console.error('Hex转RGBA失败:', error);
            return `rgba(255,255,255,${alpha})`;
        }
    }

    export function adjustRgbaAlpha(rgba: string, alpha: number): string {
        try {
            const match = rgba.match(/rgba?\(([^)]+)\)/);
            if (!match) return rgba;
            const parts = match[1].split(',').map(p => p.trim());
            const [r, g, b] = parts;
            return `rgba(${r},${g},${b},${alpha})`;
        } catch (error) {
            console.error('调整RGBA透明度失败:', error);
            return rgba;
        }
    }

    export function ensureSolidColor(color: string, defaultAlpha: number = 1): string {
        try {
            if (!color || typeof color !== 'string') return `rgba(255,255,255,${defaultAlpha})`;
            if (color.startsWith('rgba')) return adjustRgbaAlpha(color, defaultAlpha);
            if (color.startsWith('#')) return hexToRgba(color, defaultAlpha);
            return color;
        } catch (error) {
            console.error('确保实色失败:', error);
            return `rgba(255,255,255,${defaultAlpha})`;
        }
    }

    export function rgbaToHex(rgba: string): string {
        try {
            if (!rgba || typeof rgba !== 'string') return '#FFFFFF';
            if (rgba.startsWith('#')) return rgba.toUpperCase();
            const match = rgba.match(/rgba?\(([^)]+)\)/);
            if (!match) return '#FFFFFF';
            const parts = match[1].split(',').map(p => parseFloat(p.trim()));
            const [r, g, b] = parts;
            if (!Number.isFinite(r) || !Number.isFinite(g) || !Number.isFinite(b)) {
                return '#FFFFFF';
            }
            const toHex = (value: number) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, '0');
            return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
        } catch (error) {
            console.error('RGBA转Hex失败:', error);
            return '#FFFFFF';
        }
    }

    export function adjustPalette(palette: string[], alpha: number): string[] {
        try {
            if (!Array.isArray(palette)) return [];
            return palette.map(color => hexToRgba(color, alpha));
        } catch (error) {
            console.error('调整调色板失败:', error);
            return palette || [];
        }
    }
}
