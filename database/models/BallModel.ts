export type BallType =
    | "NORMAL"
    | "WIDE"
    | "NO_BALL"
    | "BYE"
    | "LEG_BYE";

export interface BallEvent {

    id: number;

    matchId: number;

    innings: number;

    over: number;

    ball: number;

    batsmanId: number;

    bowlerId: number;

    runs: number;

    extraRuns: number;

    ballType: BallType;

    isWicket: boolean;

    dismissalType?: string;

    strikerAfterBall: number;

    nonStrikerAfterBall: number;

}