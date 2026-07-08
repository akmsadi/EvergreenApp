export interface MatchState {

    inningsId: number;

    totalRuns: number;

    wickets: number;

    legalBalls: number;

    overs: string;

    runRate: number;

    strikerId: string;

    nonStrikerId: string;

    bowlerId: string;

    lastBall?: string;

    inningsCompleted: boolean;
}