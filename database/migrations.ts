import db from "./db";
import { CREATE_BATTING_SCORES_TABLE, CREATE_BOWLING_FIGURES_TABLE, CREATE_CURRENT_INNINGS_TABLE, CREATE_DELIVERIES_TABLE, CREATE_FALL_OF_WICKETS_TABLE, CREATE_INNINGS_BATTING_TABLE, CREATE_INNINGS_BOWLING_TABLE, CREATE_INNINGS_START_TABLE, CREATE_INNINGS_TABLE, CREATE_MATCH_PLAYERS_TABLE, CREATE_MATCHS_TABLE, CREATE_PARTNERSHIPS_TABLE, CREATE_PLAYERS_TABLE, CREATE_USERS_TABLE, CREATE_VENUES_TABLE } from "./schema";

function ensureMatchPlayersColumns() {
    const columns = db.getAllSync(
        "PRAGMA table_info(match_players)"
    ) as Array<{ name: string }>;

    const columnNames = new Set(columns.map((column) => column.name));

    if (!columnNames.has("batting_position")) {
        db.execSync(
            "ALTER TABLE match_players ADD COLUMN batting_position INTEGER"
        );
    }

    if (!columnNames.has("bowling_position")) {
        db.execSync(
            "ALTER TABLE match_players ADD COLUMN bowling_position INTEGER"
        );
    }

    if (!columnNames.has("is_playing_xi")) {
        db.execSync(
            "ALTER TABLE match_players ADD COLUMN is_playing_xi INTEGER NOT NULL DEFAULT 1"
        );
    }

    if (!columnNames.has("is_captain")) {
        db.execSync(
            "ALTER TABLE match_players ADD COLUMN is_captain INTEGER NOT NULL DEFAULT 0"
        );
    }
}

export function migrateDatabase() {
    db.execSync(CREATE_USERS_TABLE);
    db.execSync(CREATE_MATCHS_TABLE);
    db.execSync(CREATE_PLAYERS_TABLE);
    db.execSync(CREATE_VENUES_TABLE);
    db.execSync(CREATE_MATCH_PLAYERS_TABLE);
    ensureMatchPlayersColumns();
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