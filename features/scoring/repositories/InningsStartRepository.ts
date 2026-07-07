import db from "@/database/db";
import { InningsStartModel } from "../models/InningsStartModel";

class InningsStartRepository {

    save(
        start: InningsStartModel
    ): void {

        db.runSync(

            `
        INSERT OR REPLACE INTO innings_start
        (
            innings_id,
            striker_id,
            non_striker_id,
            bowler_id
        )
        VALUES (?, ?, ?, ?)
        `,

            [

                start.innings_id,

                start.striker_id,

                start.non_striker_id,

                start.bowler_id

            ]

        );

    }

    find(
        inningsId: number
    ): InningsStartModel | null {

        const row = db.getFirstSync(
            `
            SELECT
                innings_id,
                striker_id,
                non_striker_id,
                bowler_id
            FROM innings_start
            WHERE innings_id = ?
            LIMIT 1
            `,
            [inningsId]
        );

        if (!row) {
            return null;
        }

        return {
            ...(row as Omit<InningsStartModel, "created_at">),
            created_at: ""
        };
    }

}

export default new InningsStartRepository();