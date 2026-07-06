import { ScoringState } from "../helpers/ScoringState";
import { DeliveryModel } from "../models/DeliveryModel";
import { InningsBattingModel } from "../models/InningsBattingModel";
import { InningsBowlingModel } from "../models/InningsBowlingModel";
import { MatchState } from "../models/MatchState";
import CurrentInningsRepository from "../repositories/CurrentInningsRepository";
import DeliveryRepository from "../repositories/DeliveryRepository";
import InningsBattingRepository from "../repositories/InningsBattingRepository";
import InningsBowlingRepository from "../repositories/InningsBowlingRepository";
import InningsRepository from "../repositories/InningsRepository";
import { ExtraType } from "../types/ExtraType";
import MatchStateBuilder from "./MatchStateBuilder";

class StateCalculator {

    private inningsRepository = InningsRepository;
    private deliveryRepository = DeliveryRepository;
    private currentInningsRepository = CurrentInningsRepository;
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

        this.inningsBattingRepository.deleteAll(inningsId);
        this.inningsBowlingRepository.deleteAll(inningsId);

        // Get current innings state (striker, non-striker, bowler)
        const currentState = this.currentInningsRepository.find(inningsId);
        if (!currentState) {
            throw new Error(`Current innings state for innings ${inningsId} not found`);
        }

        // Initialize counters
        let runs = 0;
        let extras = 0;
        let wickets = 0;
        let balls = 0;
        let strikerId = currentState.striker_id;
        let nonStrikerId = currentState.non_striker_id;

        // Get all deliveries for this innings
        const deliveries = this.deliveryRepository.findAll(inningsId);
        const battingMap = new Map<number, InningsBattingModel>();
        const bowlingMap = new Map<number, InningsBowlingModel>();

        for (const existing of existingBatting) {

            battingMap.set(existing.player_id, {

                innings_id: inningsId,

                player_id: existing.player_id,

                batting_position: existing.batting_position,

                runs: 0,

                balls: 0,

                fours: 0,

                sixes: 0,

                is_out: false

            });

        }

        // Process each delivery
        for (const delivery of deliveries) {

            runs += delivery.total_runs;

            extras += delivery.extra_runs;

            if (delivery.legal_ball) {
                balls++;
            }

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

            if (delivery.legal_ball) {
                batting.balls++;
            }

            if (delivery.runs_off_bat === 4) {
                batting.fours++;
            }

            if (delivery.runs_off_bat === 6) {
                batting.sixes++;
            }

            if (delivery.is_wicket) {

                batting.is_out = true;

                batting.dismissal_type =
                    delivery.dismissal_type ?? undefined;

                batting.bowler_id =
                    delivery.bowler_id;

                batting.fielder_id =
                    delivery.fielder_id ?? undefined;

                wickets++;

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

            if (delivery.is_wicket) {
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

            if (delivery.total_runs % 2 === 1) {

                const temp = strikerId;
                strikerId = nonStrikerId;
                nonStrikerId = temp;

            }

            if (delivery.legal_ball && balls % 6 === 0) {

                const temp = strikerId;
                strikerId = nonStrikerId;
                nonStrikerId = temp;

            }

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