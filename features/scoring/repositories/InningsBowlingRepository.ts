import db from "@/database/db";
import { InningsBowlingModel } from "../models/InningsBowlingModel";

class InningsBowlingRepository {

    save(bowling: InningsBowlingModel): void {

        db.runSync(
            `
            INSERT OR REPLACE INTO innings_bowling
            (
                innings_id,
                player_id,
                balls,
                maidens,
                runs,
                wickets,
                wides,
                no_balls
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                bowling.innings_id,
                bowling.player_id,
                bowling.balls,
                bowling.maidens,
                bowling.runs,
                bowling.wickets,
                bowling.wides,
                bowling.no_balls
            ]
        );

    }

    update(bowling: InningsBowlingModel): void {

        db.runSync(
            `
            UPDATE innings_bowling
            SET
                balls = ?,
                maidens = ?,
                runs = ?,
                wickets = ?,
                wides = ?,
                no_balls = ?
            WHERE innings_id = ?
            AND player_id = ?
            `,
            [
                bowling.balls,
                bowling.maidens,
                bowling.runs,
                bowling.wickets,
                bowling.wides,
                bowling.no_balls,
                bowling.innings_id,
                bowling.player_id
            ]
        );

    }

    find(
        inningsId: number,
        playerId: number
    ): InningsBowlingModel | null {

        return db.getFirstSync(
            `
            SELECT *
            FROM innings_bowling
            WHERE innings_id = ?
            AND player_id = ?
            `,
            [
                inningsId,
                playerId
            ]
        ) as InningsBowlingModel | null;

    }

    findAll(
        inningsId: number
    ): InningsBowlingModel[] {

        return db.getAllSync(
            `
            SELECT *
            FROM innings_bowling
            WHERE innings_id = ?
            ORDER BY player_id
            `,
            [inningsId]
        ) as InningsBowlingModel[];

    }

    delete(
        inningsId: number,
        playerId: number
    ): void {

        db.runSync(
            `
            DELETE
            FROM innings_bowling
            WHERE innings_id = ?
            AND player_id = ?
            `,
            [
                inningsId,
                playerId
            ]
        );

    }

    deleteAll(inningsId: number): void {

        db.runSync(
            `
        DELETE
        FROM innings_bowling
        WHERE innings_id = ?
        `,
            [inningsId]
        );

    }

}

export default new InningsBowlingRepository();