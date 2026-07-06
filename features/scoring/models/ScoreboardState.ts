export interface ScoreboardState {

    inningsId: number;

    totalRuns: number;

    wickets: number;

    overs: string;

    runRate: number;

    extras: number;

    strikerId: number;
    strikerName: string;

    nonStrikerId: number;
    nonStrikerName: string;

    bowlerId: number;
    bowlerName: string;

    lastBall: string;

    inningsCompleted: boolean;

}