class OversHelper {

    static format(
        balls: number
    ): string {

        const overs = Math.floor(balls / 6);

        const remainingBalls = balls % 6;

        return `${overs}.${remainingBalls}`;

    }

    static ballsToOvers(
        balls: number
    ): string {

        return this.format(balls);

    }

}

// Named exports for easier importing
export function ballsToOvers(balls: number): string {
    return OversHelper.format(balls);
}

export function format(balls: number): string {
    return OversHelper.format(balls);
}

export default OversHelper;