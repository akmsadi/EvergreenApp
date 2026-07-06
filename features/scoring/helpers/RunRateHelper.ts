class RunRateHelper {

    static calculate(
        runs: number,
        legalBalls: number
    ): number {

        if (legalBalls === 0) {
            return 0;
        }

        return Number((runs / (legalBalls / 6)).toFixed(2));
    }
}

// Named export for easier importing
export function calculateRunRate(runs: number, legalBalls: number): number {
    return RunRateHelper.calculate(runs, legalBalls);
}

export default RunRateHelper;