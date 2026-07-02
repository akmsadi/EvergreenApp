import db from "./db";
import { CREATE_MATCHS_TABLE, CREATE_PLAYERS_TABLE } from "./schema";

export function migrateDatabase() {
    db.execSync(CREATE_MATCHS_TABLE);
    db.execSync(CREATE_PLAYERS_TABLE);

    console.log("Database migrated.");
}