import db from "@/database/db";
import { DeliveryModel } from "../models/DeliveryModel";

class DeliveryRepository {

    save(delivery: DeliveryModel): void {

        const now = new Date().toISOString();

        db.runSync(
            `
        INSERT INTO deliveries
        (
            innings_id,
            over_no,
            ball_no,
            batsman_id,
            non_striker_id,
            bowler_id,
            runs_off_bat,
            extra_type,
            extra_runs,
            total_runs,
            is_wicket,
            dismissal_type,
            dismissed_player_id,
            fielder_id,
            legal_ball,
            created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
            [
                delivery.innings_id,
                delivery.over_no,
                delivery.ball_no,
                delivery.batsman_id,
                delivery.non_striker_id,
                delivery.bowler_id,
                delivery.runs_off_bat,
                delivery.extra_type ?? null,
                delivery.extra_runs,
                delivery.total_runs,
                delivery.is_wicket ? 1 : 0,
                delivery.dismissal_type ?? null,
                delivery.dismissed_player_id ?? null,
                delivery.fielder_id ?? null,
                delivery.legal_ball ? 1 : 0,
                now
            ]
        );

    }

    findLastBall(inningsId: number): DeliveryModel | null {

        const row = db.getFirstSync(
            `
        SELECT *
        FROM deliveries
        WHERE innings_id = ?
        ORDER BY id DESC
        LIMIT 1
        `,
            [inningsId]
        );

        return row ? row as DeliveryModel : null;

    }

    deleteLastBall(
        inningsId: number
    ): void {

        db.runSync(
            `
        DELETE FROM deliveries
        WHERE id = (
            SELECT id
            FROM deliveries
            WHERE innings_id = ?
            ORDER BY id DESC
            LIMIT 1
        )
        `,
            [inningsId]
        );

    }

    delete(id: number): void {

        db.runSync(
            `
        DELETE FROM deliveries
        WHERE id = ?
        `,
            [id]
        );

    }

    findAll(
        inningsId: number
    ): DeliveryModel[] {

        return db.getAllSync(
            `
        SELECT *
        FROM deliveries
        WHERE innings_id=?
        ORDER BY id
        `,
            [inningsId]
        ) as DeliveryModel[];

    }

    findLastBallCommentary(
        inningsId: number
    ): string | null {

        const row = db.getFirstSync(
            `
        SELECT *
        FROM deliveries
        WHERE innings_id = ?
        ORDER BY over_no DESC, ball_no DESC
        LIMIT 1
        `,
            [inningsId]
        ) as DeliveryModel | null;

        if (!row) {
            return null;
        }

        if (row.is_wicket) {
            return "W";
        }

        if (row.extra_type === "WD") {
            return "WD";
        }

        if (row.extra_type === "NB") {
            return "NB";
        }

        if (row.extra_type === "B") {
            return `B${row.extra_runs}`;
        }

        if (row.extra_type === "LB") {
            return `LB${row.extra_runs}`;
        }

        return row.total_runs.toString();
    }

    findLast(
        inningsId: number
    ): DeliveryModel | null {

        return db.getFirstSync(
            `
        SELECT *
        FROM deliveries
        WHERE innings_id = ?
        ORDER BY over_no DESC,
                 ball_no DESC,
                 id DESC
        LIMIT 1
        `,
            [inningsId]
        ) as DeliveryModel | null;

    }

}

const deliveryRepositoryInstance: DeliveryRepository = new DeliveryRepository();
export default deliveryRepositoryInstance;