/// <reference path="../app.types.ts" />
namespace App.Utils.Data {
    export function parseCSVNumbers(csv: string, maxLength: number = 1000): number[] {
        try {
            if (!csv || typeof csv !== 'string') return [];
            const items = csv.split(',').slice(0, maxLength);
            return items
                .map(item => parseFloat(item.trim()))
                .filter(num => Number.isFinite(num));
        } catch (error) {
            console.error('解析CSV数字失败:', error);
            return [];
        }
    }

    export function formatNumber(n: number): number | string {
        try {
            if (!Number.isFinite(n)) return '0';
            if (Math.abs(n) >= 1000 || Math.abs(n) < 0.01) {
                return n.toExponential(2);
            }
            return Number(n.toFixed(2));
        } catch (error) {
            console.error('格式化数字失败:', error);
            return '0';
        }
    }

    export function computeHistogram(values: number[], binsCount: number): { binLabels: string[]; binValues: number[] } {
        try {
            if (!Array.isArray(values) || values.length === 0) {
                return { binLabels: ['0-0'], binValues: [0] };
            }
            
            const arr = values.map(v => Number(v) || 0);
            const min = Math.min(...arr);
            const max = Math.max(...arr);
            
            if (!Number.isFinite(min) || !Number.isFinite(max)) {
                return { binLabels: ['0-0'], binValues: [0] };
            }
            
            const bins = Math.max(1, Math.min(100, binsCount || 10));
            const step = (max - min) / bins || 1;
            const counts = new Array(bins).fill(0);

            arr.forEach(v => {
                let idx = Math.floor((v - min) / step);
                if (idx >= bins) idx = bins - 1;
                if (idx < 0) idx = 0;
                counts[idx]++;
            });

            const labels = counts.map((_, i) => {
                const a = min + i * step;
                const b = min + (i + 1) * step;
                return `${formatNumber(a)}-${formatNumber(b)}`;
            });

            return { binLabels: labels, binValues: counts };
        } catch (error) {
            console.error('计算直方图失败:', error);
            return { binLabels: ['0-0'], binValues: [0] };
        }
    }

    export function parseDatasetValues(raw: string, length: number): number[] {
        try {
            const values = parseCSVNumbers(raw);
            if (values.length >= length) {
                return values.slice(0, length);
            }
            const padded = [...values];
            while (padded.length < length) {
                padded.push(0);
            }
            return padded;
        } catch (error) {
            console.error('解析数据集值失败:', error);
            return new Array(Math.max(0, length || 0)).fill(0);
        }
    }
}
