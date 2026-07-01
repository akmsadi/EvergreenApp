import { BallEvent } from "../database/models/BallModel";
import { MatchSummary } from "../database/models/MatchSummary";

export function calculateMatch(
    balls: BallEvent[]
): MatchSummary {

    let score = 0;

    let wickets = 0;

    let legalBalls = 0;

    for (const ball of balls) {

        score += ball.runs;

        score += ball.extraRuns;

        if (ball.isWicket)
            wickets++;

        if (
            ball.ballType !== "WIDE" &&
            ball.ballType !== "NO_BALL"
        ) {
            legalBalls++;
        }
    }

    const overs = Math.floor(legalBalls / 6);

    const remaining = legalBalls % 6;

    return {

        score,

        wickets,

        overs: Number(
            `${overs}.${remaining}`
        ),

        balls: legalBalls,

        runRate:
            legalBalls === 0
                ? 0
                : score / (legalBalls / 6),

    };

}