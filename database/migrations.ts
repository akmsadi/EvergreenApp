import db from "./db";
import { CREATE_MATCH_PLAYERS_TABLE, CREATE_MATCHS_TABLE, CREATE_PLAYERS_TABLE, CREATE_USERS_TABLE, CREATE_VENUES_TABLE } from "./schema";

export function migrateDatabase() {
    db.execSync(CREATE_USERS_TABLE);
    db.execSync(CREATE_MATCHS_TABLE);
    db.execSync(CREATE_PLAYERS_TABLE);
    db.execSync(CREATE_VENUES_TABLE);
    db.execSync(CREATE_MATCH_PLAYERS_TABLE);
    console.log("Database migrated.");
}