export function shouldRotateStrike(
    runs: number,
    legalBall: boolean
): boolean {

    if (!legalBall)
        return false;

    return runs % 2 === 1;

}