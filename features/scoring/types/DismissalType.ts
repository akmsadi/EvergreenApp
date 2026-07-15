export enum DismissalType {
    BOWLED = "BOWLED",
    CAUGHT = "CAUGHT",
    LBW = "LBW",
    RUN_OUT = "RUN_OUT",
    STUMPED = "STUMPED",
    HIT_WICKET = "HIT_WICKET",
    OBSTRUCTING_THE_FIELD = "OBSTRUCTING_THE_FIELD",
    HIT_BALL_TWICE = "HIT_BALL_TWICE",
    TIMED_OUT = "TIMED_OUT",
    RETIRED_HURT = "RETIRED_HURT",
    RETIRED_OUT = "RETIRED_OUT"
}

const BOWLER_CREDITED_DISMISSALS = new Set<string>([
    DismissalType.BOWLED,
    DismissalType.CAUGHT,
    DismissalType.LBW,
    DismissalType.STUMPED,
    DismissalType.HIT_WICKET,
]);

export function isBowlerWicket(dismissalType: string | undefined | null): boolean {
    return !!dismissalType && BOWLER_CREDITED_DISMISSALS.has(dismissalType);
}
