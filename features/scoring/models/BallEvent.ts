import { DismissalType } from "../types/DismissalType";
import { ExtraType } from "../types/ExtraType";

export interface BallEvent {

    runs: number;

    extraType?: ExtraType;

    extraRuns?: number;

    isWicket?: boolean;

    dismissalType?: DismissalType;

    dismissedPlayerId?: string;

    fielderId?: string;

    nextBatsmanId?: string;

}