import Overs from "../helpers/OversHelper";
import RunRate from "../helpers/RunRateHelper";
import { InningsModel } from "../models/InningsModel";
import { MatchState } from "../models/MatchState";

export default class MatchStateBuilder {

    static build(
        innings: InningsModel,
        strikerId: number,
        nonStrikerId: number,
        bowlerId: number,
        lastBall?: string
    ): MatchState {

        return {
            inningsId: innings.id!,

            totalRuns: innings.total_runs,

            wickets: innings.wickets,

            legalBalls: innings.legal_balls,

            overs: Overs.ballsToOvers(innings.legal_balls),

            runRate: RunRate.calculate(
                innings.total_runs,
                innings.legal_balls
            ),

            strikerId,

            nonStrikerId,

            bowlerId,

            lastBall,

            inningsCompleted:
                innings.wickets >= 10 ||
                innings.legal_balls >= innings.max_overs * 6,
        };
    }

}