import db from "../db";
import { MatchPlayerModel } from "../models/MatchPlayerModel";

class MatchPlayerRepository {
    save(matchId: number, playerId: number, team: "team_a" | "team_b", isCaptain: number) {
        const normalizedPlayerId = Number(playerId);

        db.runSync(
            `
            INSERT INTO match_players
            (match_id, player_id, team, is_captain, created_at, updated_at)
            VALUES
            (?, ?, ?, ?, ?, ?)
            ON CONFLICT(match_id, player_id, team) DO UPDATE SET
                is_captain = excluded.is_captain,
                updated_at = excluded.updated_at
            `,
            [matchId, normalizedPlayerId, team, isCaptain, new Date().toISOString(), new Date().toISOString()],
        );
    }

    delete(matchId: number, playerId: number, team: "team_a" | "team_b") {
        db.runSync(
            `
            DELETE FROM match_players
            WHERE match_id = ? AND player_id = ? AND team = ?
            `,
            [matchId, playerId, team],
        );
    }

    getByMatch(matchId: number): MatchPlayerModel[] {
        return db.getAllSync(
            `
            SELECT *
            FROM match_players
            WHERE match_id = ?
            ORDER BY team, player_id
            `,
            [matchId],
        ) as MatchPlayerModel[];
    }

    getTeamPlayers(matchId: number, team: "team_a" | "team_b"): number[] {
        const rows = db.getAllSync(
            `
            SELECT player_id
            FROM match_players
            WHERE match_id = ? AND team = ?
            ORDER BY player_id
            `,
            [matchId, team],
        ) as Array<{ player_id: number }>;

        return rows.map((row) => Number(row.player_id));
    }

    getCaptain(matchId: number, team: "team_a" | "team_b"): number | null {
        const row = db.getFirstSync(
            `
            SELECT player_id
            FROM match_players
            WHERE match_id = ? AND team = ? AND is_captain = 1
            LIMIT 1
            `,
            [matchId, team],
        ) as { player_id: number } | null;

        return row ? row.player_id : null;
    }

    saveAssignments(matchId: number, teamAIds: number[], teamBIds: number[], teamACaptain: number | null, teamBCaptain: number | null) {
        db.withTransactionSync(() => {
            db.runSync(`DELETE FROM match_players WHERE match_id = ?`, [matchId]);

            teamAIds.forEach((playerId) => this.save(matchId, playerId, "team_a", playerId === teamACaptain ? 1 : 0));
            teamBIds.forEach((playerId) => this.save(matchId, playerId, "team_b", playerId === teamBCaptain ? 1 : 0));
        });
    }

    clear(matchId: number) {
        db.runSync(`DELETE FROM match_players WHERE match_id = ?`, [matchId]);
    }
}

export default new MatchPlayerRepository();
