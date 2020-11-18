import axios from 'axios';

interface ColorEntity {
    name: string;
    hex: string;
    rgb: { r: number; g: number; b: number };
    hsl: { h: number; s: number; l: number };
    luminance: number;
}

export async function getColors(): Promise<ColorEntity[]> {
    const res = await axios.get('https://api.color.pizza/v1/');
    return res.data.colors as ColorEntity[];
}

export function parseColor(hexText: string): [number, number, number] {
    const hexMatch = hexText.match(/^#?((?:[0-9a-f]{3}){1,2})$/i);
    if (hexMatch) {
        const str = hexMatch[1];
        let result;
        if (str.length === 3) {
            result = [
                str.charAt(0).repeat(2),
                str.charAt(1).repeat(2),
                str.charAt(2).repeat(2),
            ] as const;
        } else {
            result = [
                str.slice(0, 2),
                str.slice(2, 4),
                str.slice(4, 6),
            ] as const;
        }
        return result.map((hex) => parseInt(hex, 16)) as [
            number,
            number,
            number
        ];
    }
    throw new Error('not valid color');
}
