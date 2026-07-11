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

function ensureMatchPlayersPrimaryKey() {
    const columns = db.getAllSync(
        "PRAGMA table_info(match_players)"
    ) as Array<{ name: string; pk: number }>;

    const primaryKeyColumns = columns
        .filter((column) => column.pk > 0)
        .sort((a, b) => a.pk - b.pk)
        .map((column) => column.name);

    const hasCorrectPrimaryKey =
        primaryKeyColumns.length === 2 &&
        primaryKeyColumns[0] === "match_id" &&
        primaryKeyColumns[1] === "player_id";

    if (hasCorrectPrimaryKey) {
        return;
    }

    db.withTransactionSync(() => {
        db.execSync("DROP TABLE IF EXISTS match_players_migrating");

        db.execSync(
            `
            CREATE TABLE match_players_migrating (
                match_id INTEGER NOT NULL,
                player_id TEXT NOT NULL,
                team TEXT NOT NULL,
                batting_position INTEGER,
                bowling_position INTEGER,
                is_playing_xi INTEGER NOT NULL DEFAULT 1,
                is_captain INTEGER NOT NULL DEFAULT 0,
                created_at TEXT,
                updated_at TEXT,
                PRIMARY KEY (match_id, player_id)
            )
            `
        );

        db.execSync(
            `
            INSERT INTO match_players_migrating
            (match_id, player_id, team, batting_position, bowling_position, is_playing_xi, is_captain, created_at, updated_at)
            SELECT match_id, player_id, team, batting_position, bowling_position, is_playing_xi, is_captain, created_at, updated_at
            FROM match_players
            WHERE rowid IN (
                SELECT MAX(rowid) FROM match_players GROUP BY match_id, player_id
            )
            `
        );

        db.execSync("DROP TABLE match_players");
        db.execSync("ALTER TABLE match_players_migrating RENAME TO match_players");
    });
}

export function migrateDatabase() {
    db.execSync(CREATE_USERS_TABLE);
    db.execSync(CREATE_MATCHS_TABLE);
    db.execSync(CREATE_PLAYERS_TABLE);
    db.execSync(CREATE_VENUES_TABLE);
    db.execSync(CREATE_MATCH_PLAYERS_TABLE);
    ensureMatchPlayersColumns();
    ensureMatchPlayersPrimaryKey();
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