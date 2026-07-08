import { DeliveryModel } from "../models/DeliveryModel";
import { ExtraType } from "../types/ExtraType";

export function rotateStrike(
    strikerId: string,
    nonStrikerId: string
) {

    return {
        strikerId: nonStrikerId,
        nonStrikerId: strikerId,
    };

}

export function shouldSwapBatsman(
    delivery: DeliveryModel
): boolean {

    let runsThatAffectStrike = delivery.total_runs;

    // Penalty extra on no-ball should not affect strike by itself.
    if (delivery.extra_type === ExtraType.NO_BALL) {
        runsThatAffectStrike -= delivery.extra_runs;
    }

    // A basic wide (1 run) does not swap strike unless batters ran.
    if (delivery.extra_type === ExtraType.WIDE) {
        runsThatAffectStrike -= 1;
    }

    return runsThatAffectStrike > 0 && runsThatAffectStrike % 2 === 1;

}