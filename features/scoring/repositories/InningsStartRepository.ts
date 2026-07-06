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
        return null;
    }

}

export default new InningsStartRepository();