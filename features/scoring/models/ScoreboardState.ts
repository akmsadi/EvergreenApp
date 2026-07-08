export interface ScoreboardState {

    inningsId: number;

    inningsNumber: number;

    targetRuns?: number;

    totalRuns: number;

    wickets: number;

    overs: string;

    runRate: number;

    extras: number;

    strikerId: string;
    strikerName: string;

    nonStrikerId: string;
    nonStrikerName: string;

    bowlerId: string;
    bowlerName: string;

    lastBall: string;

    inningsCompleted: boolean;

}