import { ScoringState } from "../helpers/ScoringState";
import { rotateStrike, shouldSwapBatsman } from "../helpers/StrikeHelper";
import { DeliveryModel } from "../models/DeliveryModel";
import { InningsBattingModel } from "../models/InningsBattingModel";
import { InningsBowlingModel } from "../models/InningsBowlingModel";
import { MatchState } from "../models/MatchState";
import CurrentInningsRepository from "../repositories/CurrentInningsRepository";
import DeliveryRepository from "../repositories/DeliveryRepository";
import InningsBattingRepository from "../repositories/InningsBattingRepository";
import InningsBowlingRepository from "../repositories/InningsBowlingRepository";
import InningsRepository from "../repositories/InningsRepository";
import InningsStartRepository from "../repositories/InningsStartRepository";
import { DismissalType } from "../types/DismissalType";
import { ExtraType } from "../types/ExtraType";
import MatchStateBuilder from "./MatchStateBuilder";

class StateCalculator {

    private inningsRepository = InningsRepository;
    private deliveryRepository = DeliveryRepository;
    private currentInningsRepository = CurrentInningsRepository;
    private inningsStartRepository = InningsStartRepository;
    private inningsBattingRepository = InningsBattingRepository;
    private inningsBowlingRepository = InningsBowlingRepository;

    rebuild(
        inningsId: number
    ): MatchState {
        // Get the innings record
        const innings = this.inningsRepository.find(inningsId);
        if (!innings) {
            throw new Error(`Innings ${inningsId} not found`);
        }

        // Preserve batting entries for players who haven't faced a delivery
        // yet (e.g. a non-striker who has not been on strike) - deleteAll
        // below wipes the table, and rebuilding purely from deliveries would
        // otherwise lose their batting_position/existence entirely.
        const existingBatting = this.inningsBattingRepository.findAll(inningsId);
        const existingBattingByPlayerId = new Map(
            existingBatting.map((batting) => [batting.player_id, batting])
        );

        this.inningsBattingRepository.deleteAll(inningsId);
        this.inningsBowlingRepository.deleteAll(inningsId);

        // Get current innings state (striker, non-striker, bowler)
        const currentState = this.currentInningsRepository.find(inningsId);
        if (!currentState) {
            throw new Error(`Current innings state for innings ${inningsId} not found`);
        }

        const inningsStart =
            this.inningsStartRepository.find(inningsId);

        // Initialize counters
        let runs = 0;
        let extras = 0;
        let wickets = 0;
        let balls = 0;
        let strikerId =
            inningsStart?.striker_id ?? currentState.striker_id;
        let nonStrikerId =
            inningsStart?.non_striker_id ?? currentState.non_striker_id;

        // Get all deliveries for this innings
        const deliveries = this.deliveryRepository.findAll(inningsId);
        const battingMap = new Map<string, InningsBattingModel>();
        const bowlingMap = new Map<string, InningsBowlingModel>();

        const preservedPlayerIds = new Set<string>(
            [
                inningsStart?.striker_id,
                inningsStart?.non_striker_id,
            ].filter((playerId): playerId is string => typeof playerId === "string")
        );

        for (const playerId of preservedPlayerIds) {
            const existing = existingBattingByPlayerId.get(playerId);

            battingMap.set(playerId, {

                innings_id: inningsId,

                player_id: playerId,

                batting_position: existing?.batting_position ?? (playerId === inningsStart?.striker_id ? 1 : 2),

                runs: 0,

                balls: 0,

                fours: 0,

                sixes: 0,

                is_out: false

            });
        }

        // Process each delivery
        for (const delivery of deliveries) {

            // Use the striker pair recorded on this delivery as the source of
            // truth before calculating who faces the next ball.
            strikerId = delivery.batsman_id;
            nonStrikerId = delivery.non_striker_id;

            runs += delivery.total_runs;

            extras += delivery.extra_runs;

            if (delivery.legal_ball) {
                balls++;
            }

            const countsAsBatsmanBall =
                delivery.extra_type !== ExtraType.WIDE &&
                delivery.extra_type !== ExtraType.BYE &&
                delivery.extra_type !== ExtraType.LEG_BYE;

            // ----------------------------
            // Batting
            // ----------------------------

            let batting =
                battingMap.get(delivery.batsman_id);

            if (!batting) {

                batting = {

                    innings_id: inningsId,

                    player_id: delivery.batsman_id,

                    batting_position: battingMap.size + 1,

                    runs: 0,

                    balls: 0,

                    fours: 0,

                    sixes: 0,

                    is_out: false

                };

                battingMap.set(
                    delivery.batsman_id,
                    batting
                );

            }

            batting.runs += delivery.runs_off_bat;

            if (countsAsBatsmanBall) {
                batting.balls++;
            }

            if (delivery.runs_off_bat === 4) {
                batting.fours++;
            }

            if (delivery.runs_off_bat === 6) {
                batting.sixes++;
            }

            if (delivery.is_wicket) {

                const dismissedPlayerId =
                    delivery.dismissed_player_id ?? delivery.batsman_id;

                let dismissedBatting =
                    battingMap.get(dismissedPlayerId);

                if (!dismissedBatting) {

                    dismissedBatting = {

                        innings_id: inningsId,

                        player_id: dismissedPlayerId,

                        batting_position: battingMap.size + 1,

                        runs: 0,

                        balls: 0,

                        fours: 0,

                        sixes: 0,

                        is_out: false

                    };

                    battingMap.set(
                        dismissedPlayerId,
                        dismissedBatting
                    );

                }

                dismissedBatting.is_out =
                    delivery.dismissal_type !== DismissalType.RETIRED_HURT;

                dismissedBatting.dismissal_type =
                    delivery.dismissal_type ?? undefined;

                dismissedBatting.bowler_id =
                    delivery.dismissal_type === DismissalType.RETIRED_HURT
                        ? undefined
                        : delivery.bowler_id;

                dismissedBatting.fielder_id =
                    delivery.dismissal_type === DismissalType.RETIRED_HURT
                        ? undefined
                        : delivery.fielder_id ?? undefined;

                if (delivery.dismissal_type !== DismissalType.RETIRED_HURT) {
                    wickets++;
                }

            }

            // ----------------------------
            // Bowling
            // ----------------------------

            let bowling =
                bowlingMap.get(delivery.bowler_id);

            if (!bowling) {

                bowling = {

                    innings_id: inningsId,

                    player_id: delivery.bowler_id,

                    balls: 0,

                    maidens: 0,

                    runs: 0,

                    wickets: 0,

                    wides: 0,

                    no_balls: 0

                };

                bowlingMap.set(
                    delivery.bowler_id,
                    bowling
                );

            }

            if (delivery.legal_ball) {
                bowling.balls++;
            }

            bowling.runs += delivery.total_runs;

            if (
                delivery.is_wicket &&
                delivery.dismissal_type !== DismissalType.RETIRED_HURT
            ) {
                bowling.wickets++;
            }

            if (delivery.extra_type === ExtraType.WIDE) {
                bowling.wides += delivery.extra_runs;
            }

            if (delivery.extra_type === ExtraType.NO_BALL) {
                bowling.no_balls += delivery.extra_runs;
            }

            // ----------------------------
            // Strike rotation
            // ----------------------------

            if (shouldSwapBatsman(delivery)) {

                const rotated = rotateStrike(strikerId, nonStrikerId);
                strikerId = rotated.strikerId;
                nonStrikerId = rotated.nonStrikerId;

            }

            if (delivery.legal_ball && balls % 6 === 0) {

                const rotated = rotateStrike(strikerId, nonStrikerId);
                strikerId = rotated.strikerId;
                nonStrikerId = rotated.nonStrikerId;

            }

        }

        for (const playerId of [strikerId, nonStrikerId]) {
            if (battingMap.has(playerId)) {
                continue;
            }

            const existing = existingBattingByPlayerId.get(playerId);

            battingMap.set(playerId, {

                innings_id: inningsId,

                player_id: playerId,

                batting_position: existing?.batting_position ?? battingMap.size + 1,

                runs: 0,

                balls: 0,

                fours: 0,

                sixes: 0,

                is_out: false

            });
        }

        // Save rebuilt batting

        for (const batting of battingMap.values()) {

            this.inningsBattingRepository.save(
                batting
            );

        }

        // Save rebuilt bowling

        for (const bowling of bowlingMap.values()) {

            this.inningsBowlingRepository.save(
                bowling
            );

        }

        // Update innings

        innings.total_runs = runs;
        innings.wickets = wickets;
        innings.extras = extras;
        innings.legal_balls = balls;

        this.inningsRepository.updateScore(

            innings.id!,

            runs,

            wickets,

            balls,

            extras

        );

        // Update current innings

        currentState.striker_id = strikerId;
        currentState.non_striker_id = nonStrikerId;

        this.currentInningsRepository.update(
            currentState
        );

        return MatchStateBuilder.build(

            innings,

            strikerId,

            nonStrikerId,

            currentState.bowler_id,

            ""

        );
    }

    private processDelivery(
        state: ScoringState,
        delivery: DeliveryModel

    ) {

    }

    private rotateStrike() {

    }

    private processWicket() {

    }

}

export default new StateCalculator();