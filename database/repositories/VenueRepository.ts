import db from "../db";
import { VenueModel } from "../models/VenueModel";

class VenueRepository {

    getAll(): VenueModel[] {
        return db.getAllSync(
            "SELECT * FROM venues WHERE deleted_at IS NULL ORDER BY name"
        ) as VenueModel[];
    }

    save(venue: VenueModel) {
        db.runSync(
            `
            INSERT OR REPLACE INTO venues
            (
                id,
                name,
                created_at,
                updated_at,
                deleted_at,
                synced_at
            )
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
                venue.id,
                venue.name,
                venue.created_at,
                venue.updated_at,
                venue.deleted_at,
                venue.synced_at,
            ]
        );
    }

    saveMany(venues: VenueModel[]) {
        db.withTransactionSync(() => {
            venues.forEach((venue) => this.save(venue));
        });
    }

    getCount() {
        return db.getFirstSync<{ count: number }>(
            "SELECT COUNT(*) as count FROM venues"
        )?.count ?? 0;
    }
}

export default new VenueRepository();