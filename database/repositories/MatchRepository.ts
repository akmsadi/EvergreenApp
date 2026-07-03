import db from "../db";
import { MatchModel } from "../models/MatchModel";

class MatchRepository {

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
                synced_at,
                dirty
            )
            VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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

    getCount(): number {
        const result = db.getAllSync("SELECT COUNT(*) AS count FROM matches");
        return result.length > 0 ? Number((result[0] as { count: number }).count) : 0;
    }

    deleteAll() {
        db.runSync("DELETE FROM matches");
    }

    delete(id: number) {
        db.runSync("DELETE FROM matches WHERE id = ?", [id]);
    }
}

export default new MatchRepository();