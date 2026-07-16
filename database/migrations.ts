// import AuthService from "@/services/AuthService";
import db from "./db";
import {
    CREATE_BATTING_SCORES_TABLE,
    CREATE_BOWLING_FIGURES_TABLE,
    CREATE_CURRENT_INNINGS_TABLE,
    CREATE_DELIVERIES_TABLE,
    CREATE_FALL_OF_WICKETS_TABLE,
    CREATE_INNINGS_BATTING_TABLE,
    CREATE_INNINGS_BOWLING_TABLE,
    CREATE_INNINGS_START_TABLE,
    CREATE_INNINGS_TABLE,
    CREATE_MATCH_PLAYERS_TABLE,
    CREATE_MATCHS_TABLE,
    CREATE_PARTNERSHIPS_TABLE,
    CREATE_PLAYERS_TABLE,
    CREATE_USERS_TABLE,
    CREATE_VENUES_TABLE,
} from "./schema";

export function migrateDatabase() {
    db.execSync(CREATE_USERS_TABLE);
    db.execSync(CREATE_MATCHS_TABLE);
    db.execSync(CREATE_PLAYERS_TABLE);
    db.execSync(CREATE_VENUES_TABLE);
    db.execSync(CREATE_MATCH_PLAYERS_TABLE);
    db.execSync(CREATE_INNINGS_TABLE);
    db.execSync(CREATE_DELIVERIES_TABLE);
    db.execSync(CREATE_BATTING_SCORES_TABLE);
    db.execSync(CREATE_BOWLING_FIGURES_TABLE);
    db.execSync(CREATE_PARTNERSHIPS_TABLE);
    db.execSync(CREATE_FALL_OF_WICKETS_TABLE);
    db.execSync(CREATE_CURRENT_INNINGS_TABLE);
    db.execSync(CREATE_INNINGS_START_TABLE);
    db.execSync(CREATE_INNINGS_BATTING_TABLE);
    db.execSync(CREATE_INNINGS_BOWLING_TABLE);
    console.log("Database migrated.");
}

export async function resetDatabase() {
    // await AuthService.logout();
    db.execSync(`
        DROP TABLE IF EXISTS innings_bowling;
        DROP TABLE IF EXISTS innings_batting;
        DROP TABLE IF EXISTS innings_start;
        DROP TABLE IF EXISTS current_innings;
        DROP TABLE IF EXISTS fall_of_wickets;
        DROP TABLE IF EXISTS partnerships;
        DROP TABLE IF EXISTS bowling_figures;
        DROP TABLE IF EXISTS batting_scores;
        DROP TABLE IF EXISTS deliveries;
        DROP TABLE IF EXISTS innings;
        DROP TABLE IF EXISTS match_players;
        DROP TABLE IF EXISTS venues;
        DROP TABLE IF EXISTS players;
        DROP TABLE IF EXISTS matches;
    `);
    console.log("Database reset.");
    migrateDatabase();
}