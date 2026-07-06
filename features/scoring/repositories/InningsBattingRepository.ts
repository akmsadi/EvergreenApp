import db from "@/database/db";
import { InningsBattingModel } from "../models/InningsBattingModel";

class InningsBattingRepository {

    save(batting: InningsBattingModel): void {

        db.runSync(
            `
            INSERT OR REPLACE INTO innings_batting
            (
                innings_id,
                player_id,
                batting_position,
                runs,
                balls,
                fours,
                sixes,
                is_out,
                dismissal_type,
                bowler_id,
                fielder_id
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                batting.innings_id,
                batting.player_id,
                batting.batting_position,
                batting.runs,
                batting.balls,
                batting.fours,
                batting.sixes,
                batting.is_out ? 1 : 0,
                batting.dismissal_type ?? null,
                batting.bowler_id ?? null,
                batting.fielder_id ?? null
            ]
        );

    }

    update(batting: InningsBattingModel): void {

        db.runSync(
            `
            UPDATE innings_batting
            SET
                batting_position = ?,
                runs = ?,
                balls = ?,
                fours = ?,
                sixes = ?,
                is_out = ?,
                dismissal_type = ?,
                bowler_id = ?,
                fielder_id = ?
            WHERE innings_id = ?
            AND player_id = ?
            `,
            [
                batting.batting_position,
                batting.runs,
                batting.balls,
                batting.fours,
                batting.sixes,
                batting.is_out ? 1 : 0,
                batting.dismissal_type ?? null,
                batting.bowler_id ?? null,
                batting.fielder_id ?? null,
                batting.innings_id,
                batting.player_id
            ]
        );

    }

    find(
        inningsId: number,
        playerId: number
    ): InningsBattingModel | null {

        return db.getFirstSync(
            `
            SELECT *
            FROM innings_batting
            WHERE innings_id = ?
            AND player_id = ?
            `,
            [
                inningsId,
                playerId
            ]
        ) as InningsBattingModel | null;

    }

    findAll(
        inningsId: number
    ): InningsBattingModel[] {

        return db.getAllSync(
            `
            SELECT *
            FROM innings_batting
            WHERE innings_id = ?
            ORDER BY batting_position
            `,
            [inningsId]
        ) as InningsBattingModel[];

    }

    delete(
        inningsId: number,
        playerId: number
    ): void {

        db.runSync(
            `
            DELETE
            FROM innings_batting
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
        FROM innings_batting
        WHERE innings_id = ?
        `,
            [inningsId]
        );

    }

}

export default new InningsBattingRepository();