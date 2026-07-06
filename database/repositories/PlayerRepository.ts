import db from "../db";
import { PlayerModel } from "../models/PlayerModel";

class PlayerRepository {

    save(player: PlayerModel) {

        db.runSync(
            `
            INSERT OR REPLACE INTO players
            (
                id,
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
            )
            VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                player.id,
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
    }

    saveMany(players: PlayerModel[]) {
        db.withTransactionSync(() => {
            players.forEach((player) => this.save(player));
        });
    }

    find(id: number): PlayerModel | null {

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

    getAll(): PlayerModel[] {
        return db.getAllSync(
            "SELECT * FROM players ORDER BY name ASC"
        ) as PlayerModel[];
    }

    getCount(): number {
        const result = db.getAllSync("SELECT COUNT(*) AS count FROM players");
        return result.length > 0 ? Number((result[0] as { count: number }).count) : 0;
    }

    deleteAll() {
        db.runSync("DELETE FROM players");
    }
}

export default new PlayerRepository();