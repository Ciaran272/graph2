/// <reference path="./app.types.ts" />
namespace App {
    export const COLOR_PALETTES: Record<PaletteKey, string[]> = {
        bright: ['#FF6B6B', '#4ECDC4', '#FFD166', '#45B7D1', '#A78BFA', '#00C49A'],
        pastel: ['#FFC8A2', '#A0E7E5', '#B4F8C8', '#FBE7C6', '#C3B1E1', '#FFD6E0'],
        ocean: ['#004E92', '#00A8C5', '#70E1F5', '#28CC9E', '#045DE9', '#00C6FB'],
        sunset: ['#FF9A8B', '#FF6A88', '#FF99AC', '#F6D365', '#FDA085', '#F5576C'],
        mint: ['#00C9A7', '#92FE9D', '#00DBDE', '#4BE1EC', '#7EE8FA', '#E0FFB3'],
        warm: ['#E67E22', '#E74C3C', '#D35400', '#F39C12', '#C0392B', '#F1C40F'],
        cool: ['#2980B9', '#16A085', '#1ABC9C', '#2ECC71', '#3498DB', '#9B59B6']
    };

    export const COLOR_PALETTE_KEYS = Object.keys(COLOR_PALETTES) as PaletteKey[];

    export function getColorPalette(key: PaletteKey): string[] {
        return COLOR_PALETTES[key] || COLOR_PALETTES.bright;
    }

    export const CHART_CONSTANTS = {
        MARGINS: {
            DEFAULT: { top: 40, right: 40, bottom: 60, left: 40 },
            COMPACT: { top: 60, right: 30, bottom: 30, left: 30 }
        },
        FONT_SIZES: {
            TITLE: 20,
            AXIS_TITLE: 14,
            PIE_LABEL: 16,
            PIE_PERCENTAGE: 14,
            TREEMAP_MIN: 10,
            TREEMAP_MAX: 28
        },
        D3: {
            STREAMGRAPH_OPACITY: 0.85,
            STREAMGRAPH_CURVE_ALPHA: 0.5,
            TREEMAP_PADDING: 3
        },
        UI: {
            MIN_RECT_WIDTH_FOR_TEXT: 40,
            MIN_RECT_HEIGHT_FOR_TEXT: 20,
            TREEMAP_MAX_HEIGHT_RATIO: 0.4
        }
    } as const;
}
