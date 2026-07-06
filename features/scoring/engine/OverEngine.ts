export function isOverComplete(
    legalBalls: number
): boolean {

    return legalBalls > 0 &&
        legalBalls % 6 === 0;

}