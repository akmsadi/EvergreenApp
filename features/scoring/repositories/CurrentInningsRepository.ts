import db from "@/database/db";
import { CurrentInningsModel } from "../models/CurrentInningsModel";

class CurrentInningsRepository {

    save(state: CurrentInningsModel): void {

        const now = new Date().toISOString();

        db.runSync(
            `
            INSERT OR REPLACE INTO current_innings
            (
                innings_id,
                striker_id,
                non_striker_id,
                bowler_id,
                next_batsman_position,
                updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
                state.innings_id,
                state.striker_id,
                state.non_striker_id,
                state.bowler_id,
                state.next_batsman_position,
                now
            ]
        );

    }

    find(
        inningsId: number
    ): CurrentInningsModel | null {

        const row = db.getFirstSync(
            `
            SELECT *
            FROM current_innings
            WHERE innings_id = ?
            LIMIT 1
            `,
            [inningsId]
        );

        if (!row) {
            return null;
        }

        return row as CurrentInningsModel;

    }

    update(
        state: CurrentInningsModel
    ): void {
        db.runSync(
            `
            UPDATE current_innings
            SET
                striker_id = ?,
                non_striker_id = ?,
                bowler_id = ?
            WHERE innings_id = ?
            `,
            [
                state.striker_id,
                state.non_striker_id,
                state.bowler_id,
                state.innings_id
            ]
        );
    }

    delete(
        inningsId: number
    ): void {

        db.runSync(
            `
            DELETE FROM current_innings
            WHERE innings_id = ?
            `,
            [inningsId]
        );

    }

}

export default new CurrentInningsRepository();