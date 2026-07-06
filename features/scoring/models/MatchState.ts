export interface MatchState {

    inningsId: number;

    totalRuns: number;

    wickets: number;

    legalBalls: number;

    overs: string;

    runRate: number;

    strikerId: number;

    nonStrikerId: number;

    bowlerId: number;

    lastBall?: string;

    inningsCompleted: boolean;
}