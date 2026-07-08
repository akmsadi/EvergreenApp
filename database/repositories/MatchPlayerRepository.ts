import db from "../db";
import { MatchPlayerModel } from "../models/MatchPlayerModel";

class MatchPlayerRepository {
    save(matchId: number, playerId: string, team: "team_a" | "team_b", isCaptain: number) {
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
            [matchId, playerId, team, isCaptain, new Date().toISOString(), new Date().toISOString()],
        );
    }

    delete(matchId: number, playerId: string, team: "team_a" | "team_b") {
        db.runSync(
            `
            DELETE FROM match_players
            WHERE match_id = ? AND player_id = ? AND team = ?
            `,
            [matchId, playerId, team],
        );
    }

    deleteByMatch(matchId: number) {
        db.runSync(`DELETE FROM match_players WHERE match_id = ?`, [matchId]);
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

    getTeamPlayers(matchId: number, team: "team_a" | "team_b"): string[] {
        const rows = db.getAllSync(
            `
            SELECT player_id
            FROM match_players
            WHERE match_id = ? AND team = ?
            ORDER BY player_id
            `,
            [matchId, team],
        ) as { player_id: string }[];

        return rows.map((row) => row.player_id);
    }

    getCaptain(matchId: number, team: "team_a" | "team_b"): string | null {
        const row = db.getFirstSync(
            `
            SELECT player_id
            FROM match_players
            WHERE match_id = ? AND team = ? AND is_captain = 1
            LIMIT 1
            `,
            [matchId, team],
        ) as { player_id: string } | null;

        return row ? row.player_id : null;
    }

    saveAssignments(matchId: number, teamAIds: string[], teamBIds: string[], teamACaptain: string | null, teamBCaptain: string | null) {
        db.withTransactionSync(() => {
            db.runSync(`DELETE FROM match_players WHERE match_id = ?`, [matchId]);

            teamAIds.forEach((playerId) => this.save(matchId, playerId, "team_a", playerId === teamACaptain ? 1 : 0));
            teamBIds.forEach((playerId) => this.save(matchId, playerId, "team_b", playerId === teamBCaptain ? 1 : 0));
        });
    }

    clear(matchId: number) {
        db.runSync(`DELETE FROM match_players WHERE match_id = ?`, [matchId]);
    }

    findByBattingPosition(
        matchId: number,
        team: string,
        battingPosition: number
    ): MatchPlayerModel | null {

        const row = db.getFirstSync(
            `
        SELECT *
        FROM match_players
        WHERE
            match_id = ?
            AND team = ?
        ORDER BY player_id
        LIMIT 1 OFFSET ?
        `,
            [
                matchId,
                team,
                Math.max(0, battingPosition - 1)
            ]
        );

        return row ? row as MatchPlayerModel : null;
    }

    getRemainingBatsmen(
        matchId: number,
        team: "team_a" | "team_b",
        inningsId: number
    ): MatchPlayerModel[] {

        return db.getAllSync(
            `
        SELECT *
        FROM match_players
        WHERE
            match_id = ?
            AND team = ?
            AND player_id NOT IN (
                SELECT player_id
                FROM innings_batting
                WHERE innings_id = ?
            )
        ORDER BY player_id
        `,
            [
                matchId,
                team,
                inningsId
            ]
        ) as MatchPlayerModel[];

    }
}

export default new MatchPlayerRepository();
