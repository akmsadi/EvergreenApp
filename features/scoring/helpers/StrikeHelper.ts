export function rotateStrike(
    strikerId: number,
    nonStrikerId: number
) {

    return {
        strikerId: nonStrikerId,
        nonStrikerId: strikerId,
    };

}