import CurrentInningsRepository from "../repositories/CurrentInningsRepository";
import DeliveryRepository from "../repositories/DeliveryRepository";
import InningsRepository from "../repositories/InningsRepository";

import MatchStateBuilder from "./MatchStateBuilder";

import MatchPlayerRepository from "@/database/repositories/MatchPlayerRepository";
import MatchRepository from "@/database/repositories/MatchRepository";
import PlayerRepository from "@/database/repositories/PlayerRepository";
import { format } from "../helpers/OversHelper";
import RunRate from "../helpers/RunRateHelper";
import { BallEvent } from "../models/BallEvent";
import { CreateInningsRequest } from "../models/CreateInningsRequest";
import { CurrentInningsModel } from "../models/CurrentInningsModel";
import { ScoreboardState } from "../models/ScoreboardState";
import { ScoreResult } from "../models/ScoreResult";
import InningsBattingRepository from "../repositories/InningsBattingRepository";
import InningsBowlingRepository from "../repositories/InningsBowlingRepository";
import InningsStartRepository from "../repositories/InningsStartRepository";
import { DismissalType, isBowlerWicket } from "../types/DismissalType";
import { ExtraType } from "../types/ExtraType";
import StateCalculator from "./StateCalculator";

class ScoreEngine {

    private currentInningsId: number | null = null;

    private autoSwapEnabled = true;

    private inningsRepository = InningsRepository;

    private inningsStartRepository = InningsStartRepository;

    private inningsBattingRepository = InningsBattingRepository;
    private inningsBowlingRepository = InningsBowlingRepository;

    private deliveryRepository = DeliveryRepository;

    private currentInningsRepository = CurrentInningsRepository;

    private matchPlayerRepository = MatchPlayerRepository;

    private stateCalculator = StateCalculator;

    private playerRepository = PlayerRepository;
    private matchRepository = MatchRepository;

    private getActiveInningsId(): number {

        if (this.currentInningsId !== null) {

            const cached =
                this.inningsRepository.find(this.currentInningsId);

            if (cached && !cached.is_completed) {
                return this.currentInningsId;
            }

            this.currentInningsId = null;

        }

        const latestActiveInnings =
            this.inningsRepository.findLatestActive();

        if (!latestActiveInnings) {
            throw new Error("No active innings.");
        }

        this.currentInningsId = latestActiveInnings.id!;

        return this.currentInningsId;

    }

    async createInnings(
        request: CreateInningsRequest
    ): Promise<number> {

        const inningsId =
            this.inningsRepository.save({

                match_id: request.matchId,

                innings_number: 1,

                batting_team: request.battingTeam,

                bowling_team: request.bowlingTeam,

                max_overs: request.maxOvers,

                total_runs: 0,

                wickets: 0,

                legal_balls: 0,

                extras: 0,

                is_completed: false

            });

        this.currentInningsRepository.save({

            innings_id: inningsId,

            striker_id: request.strikerId,

            non_striker_id: request.nonStrikerId,

            bowler_id: request.bowlerId,

            next_batsman_position: 3

        });

        this.inningsBattingRepository.save({

            innings_id: inningsId,

            player_id: request.strikerId,

            batting_position: 1,

            runs: 0,

            balls: 0,

            fours: 0,

            sixes: 0,

            is_out: false

        });

        this.inningsBattingRepository.save({

            innings_id: inningsId,

            player_id: request.nonStrikerId,

            batting_position: 2,

            runs: 0,

            balls: 0,

            fours: 0,

            sixes: 0,

            is_out: false

        });

        this.inningsBowlingRepository.save({

            innings_id: inningsId,

            player_id: request.bowlerId,

            balls: 0,

            maidens: 0,

            runs: 0,

            wickets: 0,

            wides: 0,

            no_balls: 0

        });

        this.inningsStartRepository.save({

            innings_id: inningsId,

            striker_id: request.strikerId,

            non_striker_id: request.nonStrikerId,

            bowler_id: request.bowlerId,

            created_at: new Date().toISOString()

        });

        this.currentInningsId = inningsId;

        return inningsId;

    }

    async startSecondInnings(request: {
        strikerId: string;
        nonStrikerId: string;
        bowlerId: string;
    }): Promise<number> {

        if (this.currentInningsId === null) {
            throw new Error("No completed first innings.");
        }

        const firstInnings =
            this.inningsRepository.find(this.currentInningsId);

        if (!firstInnings) {
            throw new Error("First innings not found.");
        }

        if (!firstInnings.is_completed) {
            throw new Error("First innings is not completed.");
        }

        const battingTeam =
            firstInnings.bowling_team;

        const bowlingTeam =
            firstInnings.batting_team;

        const inningsId =
            this.inningsRepository.save({

                match_id: firstInnings.match_id,

                innings_number: 2,

                batting_team: battingTeam,

                bowling_team: bowlingTeam,

                total_runs: 0,

                wickets: 0,

                extras: 0,

                legal_balls: 0,

                max_overs: firstInnings.max_overs,

                target_runs: firstInnings.total_runs + 1,

                is_completed: false

            });

        this.currentInningsRepository.save({

            innings_id: inningsId,

            striker_id: request.strikerId,

            non_striker_id: request.nonStrikerId,

            bowler_id: request.bowlerId,

            next_batsman_position: 3

        });

        this.inningsBattingRepository.save({

            innings_id: inningsId,

            player_id: request.strikerId,

            batting_position: 1,

            runs: 0,

            balls: 0,

            fours: 0,

            sixes: 0,

            is_out: false

        });

        this.inningsBattingRepository.save({

            innings_id: inningsId,

            player_id: request.nonStrikerId,

            batting_position: 2,

            runs: 0,

            balls: 0,

            fours: 0,

            sixes: 0,

            is_out: false

        });

        this.inningsBowlingRepository.save({

            innings_id: inningsId,

            player_id: request.bowlerId,

            balls: 0,

            maidens: 0,

            runs: 0,

            wickets: 0,

            wides: 0,

            no_balls: 0

        });

        this.currentInningsId = inningsId;

        return inningsId;

    }

    async startInnings(
        inningsId: number,
        strikerId: string,
        nonStrikerId: string,
        bowlerId: string
    ): Promise<void> {

        this.currentInningsId = inningsId;

        this.currentInningsRepository.save({
            innings_id: inningsId,
            striker_id: strikerId,
            non_striker_id: nonStrikerId,
            bowler_id: bowlerId,
            next_batsman_position: 3
        });

    }

    async resumeMatch(
        matchId: number
    ): Promise<boolean> {

        const innings =
            this.inningsRepository.findCurrent(matchId);

        if (!innings) {
            return false;
        }

        const current =
            this.currentInningsRepository.find(innings.id!);

        if (!current) {
            throw new Error("Current innings not initialized.");
        }

        this.currentInningsId = innings.id!;

        return true;

    }

    async changeBowler(
        bowlerId: string
    ): Promise<ScoreboardState> {

        const innings =
            this.inningsRepository.find(this.getActiveInningsId());

        if (!innings) {
            throw new Error("Innings not found.");
        }

        const current =
            this.currentInningsRepository.find(innings.id!);

        if (!current) {
            throw new Error("Current innings not found.");
        }

        current.bowler_id = bowlerId;

        this.currentInningsRepository.update(current);

        let bowling =
            this.inningsBowlingRepository.find(
                innings.id!,
                bowlerId
            );

        if (!bowling) {

            bowling = {

                innings_id: innings.id!,

                player_id: bowlerId,

                balls: 0,

                maidens: 0,

                runs: 0,

                wickets: 0,

                wides: 0,

                no_balls: 0

            };

            this.inningsBowlingRepository.save(
                bowling
            );

        }

        return await this.getScoreboard();

    }

    isAutoSwapEnabled(): boolean {
        return this.autoSwapEnabled;
    }

    setAutoSwapEnabled(enabled: boolean): void {
        this.autoSwapEnabled = enabled;
    }

    async swapStrike(): Promise<ScoreboardState> {

        const innings =
            this.inningsRepository.find(this.getActiveInningsId());

        if (!innings) {
            throw new Error("Innings not found.");
        }

        const current =
            this.currentInningsRepository.find(innings.id!);

        if (!current) {
            throw new Error("Current innings not found.");
        }

        const temp = current.striker_id;
        current.striker_id = current.non_striker_id;
        current.non_striker_id = temp;

        this.currentInningsRepository.update(current);

        return await this.getScoreboard();

    }

    async newBatsman(
        playerId: string
    ): Promise<void> {

        const current =
            this.currentInningsRepository.find(
                this.getActiveInningsId()
            );

        if (!current) {
            throw new Error("Current innings not found.");
        }

        current.striker_id = playerId;

        current.next_batsman_position++;

        this.currentInningsRepository.update(current);

    }

    async scoreBall(event: BallEvent): Promise<ScoreResult> {

        const innings = this.inningsRepository.find(this.getActiveInningsId());

        if (!innings) {
            throw new Error("Innings not found.");
        }

        const current = this.currentInningsRepository.find(innings.id!);

        if (!current) {
            throw new Error("Current innings not initialized.");
        }

        const extraRuns = event.extraRuns ?? 0;

        const totalRuns = event.runs + extraRuns;

        const legalBall =
            event.extraType !== ExtraType.WIDE &&
            event.extraType !== ExtraType.NO_BALL;

        const countsAsBatsmanBall =
            event.extraType !== ExtraType.WIDE &&
            event.extraType !== ExtraType.BYE &&
            event.extraType !== ExtraType.LEG_BYE;

        const runsOffBat =
            event.extraType === ExtraType.BYE ||
                event.extraType === ExtraType.LEG_BYE
                ? 0
                : event.runs;

        const overNo = Math.floor(innings.legal_balls / 6);

        const ballNo = innings.legal_balls % 6;

        this.deliveryRepository.save({

            innings_id: innings.id!,

            over_no: overNo,

            ball_no: ballNo,

            batsman_id: current.striker_id,

            non_striker_id: current.non_striker_id,

            bowler_id: current.bowler_id,

            runs_off_bat: runsOffBat,

            extra_type: event.extraType ?? null,

            extra_runs: extraRuns,

            total_runs: totalRuns,

            is_wicket: event.isWicket ?? false,

            dismissal_type: event.dismissalType ?? null,

            dismissed_player_id: event.dismissedPlayerId ?? null,

            fielder_id: event.fielderId ?? null,

            legal_ball: legalBall

        });

        // ----------------------------------------------------
        // Update batting statistics
        // ----------------------------------------------------

        const batting =
            this.inningsBattingRepository.find(
                innings.id!,
                current.striker_id
            );

        if (!batting) {
            throw new Error("Batting record not found.");
        }

        if (countsAsBatsmanBall) {
            batting.balls++;
        }

        batting.runs += runsOffBat;

        if (runsOffBat === 4) {
            batting.fours++;
        }

        if (runsOffBat === 6) {
            batting.sixes++;
        }

        this.inningsBattingRepository.update(
            batting
        );

        if (
            event.isWicket &&
            event.dismissalType !== DismissalType.RETIRED_HURT
        ) {

            const dismissedPlayerId =
                event.dismissedPlayerId ?? current.striker_id;

            const dismissedBatting =
                dismissedPlayerId === current.striker_id
                    ? batting
                    : this.inningsBattingRepository.find(
                        innings.id!,
                        dismissedPlayerId
                    );

            if (dismissedBatting) {

                dismissedBatting.is_out = true;

                dismissedBatting.dismissal_type =
                    event.dismissalType ?? undefined;

                dismissedBatting.bowler_id =
                    current.bowler_id;

                dismissedBatting.fielder_id =
                    event.fielderId ?? undefined;

                this.inningsBattingRepository.update(
                    dismissedBatting
                );

            }

        }

        // ----------------------------------------------------
        // Update bowling statistics
        // ----------------------------------------------------

        let bowling =
            this.inningsBowlingRepository.find(
                innings.id!,
                current.bowler_id
            );

        if (!bowling) {

            bowling = {

                innings_id: innings.id!,

                player_id: current.bowler_id,

                balls: 0,

                maidens: 0,

                runs: 0,

                wickets: 0,

                wides: 0,

                no_balls: 0

            };

            this.inningsBowlingRepository.save(
                bowling
            );

        }

        if (legalBall) {
            bowling.balls++;
        }

        bowling.runs += totalRuns;

        if (event.extraType === ExtraType.WIDE) {
            bowling.wides += extraRuns;
        }

        if (event.extraType === ExtraType.NO_BALL) {
            bowling.no_balls += extraRuns;
        }

        if (
            event.isWicket &&
            isBowlerWicket(event.dismissalType)
        ) {
            bowling.wickets++;
        }

        this.inningsBowlingRepository.update(
            bowling
        );

        // ----------------------------------------------------
        // Update innings totals
        // ----------------------------------------------------

        innings.total_runs += totalRuns;

        innings.extras += extraRuns;

        if (
            event.isWicket &&
            event.dismissalType !== DismissalType.RETIRED_HURT
        ) {

            innings.wickets++;

        }

        if (legalBall) {
            innings.legal_balls++;
        }

        this.inningsRepository.updateScore(

            innings.id!,

            innings.total_runs,

            innings.wickets,

            innings.legal_balls,

            innings.extras

        );

        this.currentInningsRepository.update(
            current
        );

        const state =
            this.stateCalculator.rebuild(
                innings.id!,
                this.autoSwapEnabled
            );

        return {

            success: true,

            state

        };

    }

    async getState() {

        const innings =
            this.inningsRepository.find(this.getActiveInningsId());

        if (!innings) {
            throw new Error("Innings not found.");
        }

        const current =
            this.currentInningsRepository.find(innings.id!);

        if (!current) {
            throw new Error("Current innings not initialized.");
        }

        return MatchStateBuilder.build(
            innings,
            current.striker_id,
            current.non_striker_id,
            current.bowler_id
        );

    }

    async undo(): Promise<void> {

        const innings =
            this.inningsRepository.find(this.getActiveInningsId());

        if (!innings) {
            throw new Error("Innings not found.");
        }

        const lastDelivery =
            this.deliveryRepository.findLast(innings.id!);

        if (!lastDelivery) {
            return;
        }

        this.deliveryRepository.delete(lastDelivery.id!);

        this.stateCalculator.rebuild(
            innings.id!,
            this.autoSwapEnabled
        );

    }

    async scoreRuns(runs: number) {
        return this.scoreBall({ runs });
    }

    async wide(runs = 1) {
        return this.scoreBall({
            runs: 0,
            extraType: ExtraType.WIDE,
            extraRuns: runs
        });
    }

    async noBall(runsOffBat = 0) {
        return this.scoreBall({
            runs: runsOffBat,
            extraType: ExtraType.NO_BALL,
            extraRuns: 1
        });
    }

    async bye(runs: number) {
        return this.scoreBall({
            runs: 0,
            extraType: ExtraType.BYE,
            extraRuns: runs
        });
    }

    async legBye(runs: number) {
        return this.scoreBall({
            runs: 0,
            extraType: ExtraType.LEG_BYE,
            extraRuns: runs
        });
    }

    async bowled() {
        return this.scoreBall({
            runs: 0,
            isWicket: true,
            dismissalType: DismissalType.BOWLED
        });
    }

    async caught(fielderId: string) {
        return this.scoreBall({
            runs: 0,
            isWicket: true,
            dismissalType: DismissalType.CAUGHT,
            fielderId
        });
    }

    async lbw() {
        return this.scoreBall({
            runs: 0,
            isWicket: true,
            dismissalType: DismissalType.LBW
        });
    }

    async runOut(runs = 0, dismissedPlayerId?: string) {
        return this.scoreBall({
            runs,
            isWicket: true,
            dismissalType: DismissalType.RUN_OUT,
            dismissedPlayerId
        });
    }

    async stumped() {
        return this.scoreBall({
            runs: 0,
            isWicket: true,
            dismissalType: DismissalType.STUMPED
        });
    }

    async wicket(
        dismissalType: DismissalType,
        options?: {
            runs?: number;
            dismissedPlayerId?: string;
            nextBatsmanId?: string;
            fielderId?: string;
        }
    ) {

        return this.scoreBall({

            runs: options?.runs ?? 0,

            isWicket: true,

            dismissalType,

            dismissedPlayerId: options?.dismissedPlayerId,

            nextBatsmanId: options?.nextBatsmanId,

            fielderId: options?.fielderId

        });

    }

    async getScoreboard(): Promise<ScoreboardState> {

        const innings =
            this.inningsRepository.find(this.getActiveInningsId());

        if (!innings) {
            throw new Error("Innings not found.");
        }

        const current =
            this.currentInningsRepository.find(innings.id!);

        if (!current) {
            throw new Error("Current innings not found.");
        }

        const striker =
            this.playerRepository.find(current.striker_id);

        const nonStriker =
            this.playerRepository.find(current.non_striker_id);

        const bowler =
            this.playerRepository.find(current.bowler_id);

        return {

            inningsId: innings.id!,

            inningsNumber: innings.innings_number,

            targetRuns: innings.target_runs,

            totalRuns: innings.total_runs,

            wickets: innings.wickets,

            overs: format(
                innings.legal_balls
            ),

            runRate: RunRate.calculate(

                innings.total_runs,

                innings.legal_balls

            ),

            extras: innings.extras,

            strikerId: current.striker_id,

            strikerName: striker?.name ?? "Unknown",

            nonStrikerId: current.non_striker_id,

            nonStrikerName: nonStriker?.name ?? "Unknown",

            bowlerId: current.bowler_id,

            bowlerName: bowler?.name ?? "Unknown",

            lastBall:
                this.deliveryRepository.findLastBallCommentary(
                    innings.id!
                ) ?? "",

            inningsCompleted:
                innings.is_completed

        };

    }

    async selectNextBatsman(
        playerId: string
    ): Promise<void> {

        const innings = this.inningsRepository.find(this.getActiveInningsId());

        if (!innings) {
            throw new Error("Innings not found.");
        }

        const current = this.currentInningsRepository.find(innings.id!);

        if (!current) {
            throw new Error("Current innings not found.");
        }

        this.inningsBattingRepository.save({

            innings_id: innings.id!,

            player_id: playerId,

            batting_position: current.next_batsman_position,

            runs: 0,

            balls: 0,

            fours: 0,

            sixes: 0,

            is_out: false

        });

        current.striker_id = playerId;

        current.next_batsman_position++;

        this.currentInningsRepository.update(current);

    }

    async resolveWicket(
        nextBatsmanId: string | undefined,
        dismissedPlayerId: string,
        dismissalType: DismissalType,
        fielderId?: string
    ): Promise<void> {

        const innings =
            this.inningsRepository.find(this.getActiveInningsId());

        if (!innings) {
            throw new Error("Innings not found.");
        }

        const current =
            this.currentInningsRepository.find(innings.id!);

        if (!current) {
            throw new Error("Current innings not found.");
        }

        const lastDelivery =
            this.deliveryRepository.findLast(innings.id!);

        if (!lastDelivery || !lastDelivery.is_wicket) {
            throw new Error("Last delivery is not a wicket.");
        }

        this.deliveryRepository.updateWicketSelection(
            lastDelivery.id!,
            dismissedPlayerId,
            dismissalType,
            fielderId
        );

        const strikerBatting =
            this.inningsBattingRepository.find(
                innings.id!,
                current.striker_id
            );

        const dismissedBatting =
            this.inningsBattingRepository.find(
                innings.id!,
                dismissedPlayerId
            );

        const bowling =
            this.inningsBowlingRepository.find(
                innings.id!,
                lastDelivery.bowler_id
            );

        if (
            dismissedPlayerId !== current.striker_id &&
            strikerBatting
        ) {
            strikerBatting.is_out = false;
            strikerBatting.dismissal_type = undefined;
            strikerBatting.bowler_id = undefined;
            strikerBatting.fielder_id = undefined;

            this.inningsBattingRepository.update(
                strikerBatting
            );
        }

        if (dismissedBatting) {
            dismissedBatting.is_out =
                dismissalType !== DismissalType.RETIRED_HURT;
            dismissedBatting.dismissal_type =
                dismissalType ?? undefined;
            dismissedBatting.bowler_id =
                dismissalType === DismissalType.RETIRED_HURT
                    ? undefined
                    : lastDelivery.bowler_id;
            dismissedBatting.fielder_id =
                dismissalType === DismissalType.RETIRED_HURT
                    ? undefined
                    : fielderId ?? undefined;

            this.inningsBattingRepository.update(
                dismissedBatting
            );
        }

        if (
            dismissalType === DismissalType.RETIRED_HURT &&
            bowling &&
            bowling.wickets > 0
        ) {
            bowling.wickets--;

            this.inningsBowlingRepository.update(
                bowling
            );
        }

        if (
            dismissalType === DismissalType.RETIRED_HURT &&
            innings.wickets > 0
        ) {
            innings.wickets--;

            this.inningsRepository.updateScore(
                innings.id!,
                innings.total_runs,
                innings.wickets,
                innings.legal_balls,
                innings.extras
            );
        }

        if (nextBatsmanId) {
            this.addNextBatsman(
                innings.id!,
                current,
                dismissedPlayerId,
                nextBatsmanId
            );
        }

    }

    async changeBatsman(
        outgoingPlayerId: string,
        incomingPlayerId: string
    ): Promise<void> {

        const innings =
            this.inningsRepository.find(this.getActiveInningsId());

        if (!innings) {
            throw new Error("Innings not found.");
        }

        const current =
            this.currentInningsRepository.find(innings.id!);

        if (!current) {
            throw new Error("Current innings not found.");
        }

        if (
            outgoingPlayerId !== current.striker_id &&
            outgoingPlayerId !== current.non_striker_id
        ) {
            throw new Error("Selected batsman is not currently at the crease.");
        }

        const outgoingBatting =
            this.inningsBattingRepository.find(
                innings.id!,
                outgoingPlayerId
            );

        if (outgoingBatting) {
            outgoingBatting.is_out = false;
            outgoingBatting.dismissal_type = DismissalType.RETIRED_HURT;
            outgoingBatting.bowler_id = undefined;
            outgoingBatting.fielder_id = undefined;

            this.inningsBattingRepository.update(
                outgoingBatting
            );
        }

        const returningBatting =
            this.inningsBattingRepository.find(
                innings.id!,
                incomingPlayerId
            );

        if (returningBatting) {

            returningBatting.is_out = false;
            returningBatting.dismissal_type = undefined;
            returningBatting.bowler_id = undefined;
            returningBatting.fielder_id = undefined;

            this.inningsBattingRepository.update(
                returningBatting
            );

            if (outgoingPlayerId === current.striker_id) {
                current.striker_id = incomingPlayerId;
            } else {
                current.non_striker_id = incomingPlayerId;
            }

            this.currentInningsRepository.update(current);

        } else {

            this.addNextBatsman(
                innings.id!,
                current,
                outgoingPlayerId,
                incomingPlayerId
            );

        }

    }

    async recordWicket(
        runs: number,
        dismissedPlayerId: string,
        dismissalType: DismissalType,
        nextBatsmanId?: string,
        fielderId?: string
    ): Promise<void> {

        await this.scoreBall({

            runs,

            isWicket: true,

            dismissalType,

            dismissedPlayerId,

            fielderId

        });

        const innings =
            this.inningsRepository.find(this.getActiveInningsId());

        if (!innings) {
            throw new Error("Innings not found.");
        }

        const current =
            this.currentInningsRepository.find(innings.id!);

        if (!current) {
            throw new Error("Current innings not found.");
        }

        if (nextBatsmanId) {
            this.addNextBatsman(
                innings.id!,
                current,
                dismissedPlayerId,
                nextBatsmanId
            );
        }

    }

    private addNextBatsman(
        inningsId: number,
        current: CurrentInningsModel,
        dismissedPlayerId: string,
        nextBatsmanId: string
    ): void {

        this.inningsBattingRepository.save({

            innings_id: inningsId,

            player_id: nextBatsmanId,

            batting_position: current.next_batsman_position,

            runs: 0,

            balls: 0,

            fours: 0,

            sixes: 0,

            is_out: false

        });

        if (dismissedPlayerId === current.striker_id) {
            current.striker_id = nextBatsmanId;
        } else if (dismissedPlayerId === current.non_striker_id) {
            current.non_striker_id = nextBatsmanId;
        } else {
            current.striker_id = nextBatsmanId;
        }

        current.next_batsman_position++;

        this.currentInningsRepository.update(current);

    }

    isEndOfOver(): boolean {

        const innings =
            this.inningsRepository.find(this.getActiveInningsId());

        if (!innings) {
            return false;
        }

        if (innings.legal_balls === 0 || innings.legal_balls % 6 !== 0) {
            return false;
        }

        const lastDelivery =
            this.deliveryRepository.findLast(innings.id!);

        return !!lastDelivery && lastDelivery.legal_ball;

    }

    async endInnings(): Promise<{ inningsNumber: number; matchId: number }> {

        const innings =
            this.inningsRepository.find(this.getActiveInningsId());

        if (!innings) {
            throw new Error("Innings not found.");
        }

        this.inningsRepository.complete(
            innings.id!
        );

        return {
            inningsNumber: innings.innings_number,
            matchId: innings.match_id
        };

    }

    async finishMatch(): Promise<void> {

        if (this.currentInningsId === null) {
            throw new Error("Second innings not found.");
        }

        const innings =
            this.inningsRepository.find(this.currentInningsId);

        if (!innings) {
            throw new Error("Second innings not found.");
        }

        const match =
            this.matchRepository.find(
                innings.match_id
            );

        if (!match) {
            throw new Error("Match not found.");
        }

        const firstInnings =
            this.inningsRepository.findByMatchAndNo(
                innings.match_id,
                1
            );

        if (!firstInnings) {
            throw new Error("First innings not found.");
        }

        let resultType: string;
        let resultSummary: string;

        const teamName = (team: "team_a" | "team_b") =>
            team === "team_a" ? match.team_name : match.opponent_name;

        if (innings.total_runs >= (innings.target_runs ?? 0)) {

            const wicketsLeft =
                10 - innings.wickets;

            resultType = "team_b_win";

            resultSummary =
                `${teamName(innings.batting_team)} won by ${wicketsLeft} wicket${wicketsLeft === 1 ? "" : "s"}`;

        } else if (innings.total_runs === firstInnings.total_runs) {

            resultType = "tie";

            resultSummary = "Match Tied";

        } else {

            const runs =
                firstInnings.total_runs -
                innings.total_runs;

            resultType = "team_a_win";

            resultSummary =
                `${teamName(firstInnings.batting_team)} won by ${runs} run${runs === 1 ? "" : "s"}`;

        }

        match.match_status = "completed";
        match.result_type = resultType;
        match.result_summary = resultSummary;

        this.matchRepository.updateResult(
            match
        );

    }
}

export default new ScoreEngine();