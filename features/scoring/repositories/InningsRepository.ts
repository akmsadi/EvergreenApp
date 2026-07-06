import db from "@/database/db";
import { InningsModel } from "../models/InningsModel";

class InningsRepository {
    save(innings: InningsModel): number {

        const result = db.runSync(
            `
        INSERT INTO innings
        (
            match_id,
            innings_number,
            batting_team,
            bowling_team,
            max_overs,
            target_runs,
            total_runs,
            wickets,
            legal_balls,
            extras,
            is_completed,
            created_at,
            updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
            [
                innings.match_id,
                innings.innings_number,
                innings.batting_team,
                innings.bowling_team,
                innings.max_overs,
                innings.target_runs ?? null,
                innings.total_runs,
                innings.wickets,
                innings.legal_balls,
                innings.extras,
                innings.is_completed ? 1 : 0,
                innings.created_at ?? null,
                innings.updated_at ?? null,
            ]
        );
        return Number(
            result.lastInsertRowId
        );
    }
    update(innings: InningsModel) { }
    find(id: number): InningsModel | null {

        const row = db.getFirstSync(
            `SELECT * FROM innings WHERE id = ?`,
            [id]
        );

        if (!row) {
            return null;
        }

        return row as InningsModel;
    }
    findByMatch(matchId: number) { }
    findCurrent(matchId: number): InningsModel | null {

        const row = db.getFirstSync(
            `
        SELECT *
        FROM innings
        WHERE match_id = ?
        AND is_completed = 0
        LIMIT 1
        `,
            [matchId]
        );

        if (!row) {
            return null;
        }

        return row as InningsModel;
    }
    complete(id: number): void {

        db.runSync(
            `
        UPDATE innings
        SET
            is_completed = 1
        WHERE id = ?
        `,
            [id]
        );

    }
    delete(id: number) { }
    updateScore(
        inningsId: number,
        runs: number,
        wickets: number,
        legalBalls: number,
        extras: number
    ): void {

        db.runSync(
            `
        UPDATE innings
        SET
            total_runs = ?,
            wickets = ?,
            legal_balls = ?,
            extras = ?,
            updated_at = ?
        WHERE id = ?
        `,
            [
                runs,
                wickets,
                legalBalls,
                extras,
                new Date().toISOString(),
                inningsId
            ]
        );

    }

    findByMatchAndNo(
        matchId: number,
        inningsNo: number
    ): InningsModel | null {

        return db.getFirstSync(
            `
        SELECT *
        FROM innings
        WHERE match_id = ?
        AND innings_no = ?
        `,
            [
                matchId,
                inningsNo
            ]
        ) as InningsModel | null;

    }

    findCurrentMatchLast(): InningsModel | null {

        return db.getFirstSync(
            `
        SELECT *
        FROM innings
        ORDER BY id DESC
        LIMIT 1
        `
        ) as InningsModel | null;

    }

}

export default new InningsRepository();