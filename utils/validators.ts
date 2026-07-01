export function required(value: string) {
    return value.trim().length > 0;
}

export function maxLength(
    value: string,
    length: number
) {
    return value.length <= length;
}