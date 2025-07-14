export interface LabelColorSchema {
    keyValue: string,
    color: string,
}

//  Todo : color theme need to do apply, then create function to mapping color
export const mapColorToHex = (color: string): string => {
    const colorMap: Record<string, string> = {
        green: '#10B981',
        red: '#EF4444',
        yellow: '#F59E0B',
        blue: '#3B82F6',
        gray: '#6B7280',
    };
    return colorMap[color] || '#6B7280';
};

export const generateSchemaFromEnum = (
    colorMap: Record<string, string>
): LabelColorSchema[] => {
    return Object.entries(colorMap).map(([status, color]) => ({
        keyValue: status,
        color,
    }));
};

export const getColorFromLabelColorSchema = (schema: LabelColorSchema[], status: string): string => {
    const color = schema.find(s => s.keyValue === status)?.color ?? 'gray';
    return color.startsWith('#') ? color : mapColorToHex(color);
};