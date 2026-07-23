import { PlayerIDs } from "@/types/player";
import { generateId } from "@/utils/Common";
import db from "../db";
import { PlayerModel } from "../models/PlayerModel";

class PlayerRepository {

    insert(player: PlayerModel): string {
        db.runSync(
            `INSERT INTO players (
                id,
                server_id,
                name,
                organization,
                phone,
                email,
                address,
                guest_of_player_id,
                status,
                total_contribution,
                total_expense,
                created_at,
                updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            player.id,
            player.server_id,
            player.name,
            player.organization,
            player.phone,
            player.email,
            player.address,
            player.guest_of_player_id,
            player.status,
            player.total_contribution,
            player.total_expense,
            player.created_at,
            player.updated_at,
        ]
        );
        return player.id;
    }

    insertAppPlayer(player: PlayerModel): string {
        player.id = generateId();
        return this.insert(player);
    }

    update(player: PlayerModel) {
        db.runSync(
            `UPDATE players
                SET
                    server_id=?,
                    name=?,
                    organization=?,
                    phone=?,
                    email=?,
                    address=?,
                    guest_of_player_id=?,
                    status=?,
                    total_contribution=?,
                    total_expense=?,
                    updated_at=?
                WHERE id=?`,
            [
                player.server_id,
                player.name,
                player.organization,
                player.phone,
                player.email,
                player.address,
                player.guest_of_player_id,
                player.status,
                player.total_contribution,
                player.total_expense,
                player.updated_at,
                player.id,
            ]
        );
    }

    syncPlayers(players: PlayerModel[]) {
        db.withTransactionSync(() => {
            players.forEach((player) => {
                const existing = this.find(player.id);
                if (existing) {
                    this.update(player);
                } else {
                    this.insert(player);
                }
            });
        });
    }

    getByServerId(server_id: number | null): PlayerModel | null {
        const row = db.getFirstSync(`
            SELECT *
            FROM players
            WHERE server_id = ?
        `, [server_id]) as PlayerModel | null;
        return row;
    }

    find(id: string): PlayerModel | null {

        const row = db.getFirstSync(
            `
        SELECT *
        FROM players
        WHERE id = ?
        `,
            [id]
        ) as PlayerModel | null;

        return row;
    }

    getAppPlayers(): PlayerModel[] | [] {
        const players = db.getAllSync(
            "SELECT * FROM players WHERE server_id IS NULL"
        ) as PlayerModel[];

        return players.length > 0 ? players : [];
    }

    updateServerIds(playerIds: PlayerIDs[]) {
        db.withTransactionSync(() => {
            playerIds.forEach(({ id, server_id }) => {
                db.runSync(
                    `
                UPDATE players
                SET
                    server_id = ?
                WHERE id = ?
                `,
                    [
                        server_id,
                        id,
                    ]
                );
            });
        });
    }

    getAll(): PlayerModel[] {
        return db.getAllSync(`
            SELECT p.*, guest.name AS guest_of_player_name
            FROM players p
            LEFT JOIN players guest ON p.guest_of_player_id = guest.server_id;
            ORDER BY name ASC
        `
        ) as PlayerModel[];
    }

    getCount(): number {
        const result = db.getAllSync("SELECT COUNT(*) AS count FROM players");
        return result.length > 0 ? Number((result[0] as { count: number }).count) : 0;
    }

    deleteAll() {
        db.runSync("DELETE FROM players");
    }

    delete(id: string) {
        db.runSync("DELETE FROM players WHERE id = ?", [id]);
    }

    clearServerIds() {
        db.runSync(`UPDATE players SET server_id = NULL`);
    }
}

export default new PlayerRepository();