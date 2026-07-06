import db from "../db";
import { MatchModel } from "../models/MatchModel";
import MatchPlayerRepository from "./MatchPlayerRepository";

class MatchRepository {

    find(id: number): MatchModel | null {
        return (
            db.getFirstSync(
                `
            SELECT *
            FROM matches
            WHERE id = ?
            `,
                [id]
            ) as MatchModel | null
        );
    }

    save(match: MatchModel) {

        db.runSync(
            `
            INSERT OR REPLACE INTO matches
            (
                id,
                match_type,
                format_overs,
                venue,
                venue_id,
                scheduled_at,
                team_name,
                opponent_name,
                toss_winner,
                toss_decision,
                match_status,
                result_type,
                result_summary,
                notes,
                created_at,
                updated_at,
                deleted_at,
                from_admin,
                synced_at,
                dirty
            )
            VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                match.id,
                match.match_type,
                match.format_overs,
                match.venue,
                match.venue_id,
                match.scheduled_at,
                match.team_name,
                match.opponent_name,
                match.toss_winner,
                match.toss_decision,
                match.match_status,
                match.result_type,
                match.result_summary,
                match.notes,
                match.created_at,
                match.updated_at,
                match.deleted_at,
                match.from_admin,
                match.synced_at,
                match.dirty,
            ]
        );
    }

    saveMany(matches: MatchModel[]) {
        db.withTransactionSync(() => {
            matches.forEach((match) => this.save(match));
        });
    }

    getAll(): MatchModel[] {
        return db.getAllSync(
            "SELECT * FROM matches ORDER BY scheduled_at DESC"
        ) as MatchModel[];
    }

    getByStatus(status: string): MatchModel[] {
        return db.getAllSync(
            `
        SELECT *
        FROM matches
        WHERE match_status = ?
        ORDER BY scheduled_at
        `,
            [status]
        ) as MatchModel[];
    }

    getCount(): number {
        const result = db.getAllSync("SELECT COUNT(*) AS count FROM matches");
        return result.length > 0 ? Number((result[0] as { count: number }).count) : 0;
    }

    deleteAll() {
        db.runSync("DELETE FROM matches");
    }

    delete(id: number) {
        db.withTransactionSync(() => {
            MatchPlayerRepository.deleteByMatch(id);
            db.runSync("DELETE FROM matches WHERE id = ?", [id]);
        });
    }

    updateToss(
        matchId: number,
        tossWinner: "team_a" | "team_b",
        tossDecision: "bat" | "bowl"
    ): void {

        db.runSync(
            `
        UPDATE matches
        SET
            toss_winner = ?,
            toss_decision = ?,
            updated_at = ?
        WHERE id = ?
        `,
            [
                tossWinner,
                tossDecision,
                new Date().toISOString(),
                matchId
            ]
        );

    }

    updateResult(match: MatchModel): void {

        db.runSync(
            `
        UPDATE matches
        SET
            match_status = ?,
            result_type = ?,
            result_summary = ?,
            updated_at = ?
        WHERE id = ?
        `,
            [
                match.match_status,
                match.result_type,
                match.result_summary,
                new Date().toISOString(),
                match.id
            ]
        );

    }
}

export default new MatchRepository();