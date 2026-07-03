export const CREATE_USERS_TABLE = `
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,

    username TEXT NOT NULL,
    email TEXT,

    access_token TEXT,

    is_active INTEGER DEFAULT 1,

    created_at TEXT,
    updated_at TEXT,

    last_login_at TEXT
);
`;

export const CREATE_MATCHS_TABLE = `
CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY,

    match_type TEXT NOT NULL,
    format_overs INTEGER NOT NULL,

    venue TEXT,
    venue_id INTEGER,

    scheduled_at TEXT,

    team_name TEXT NOT NULL,
    opponent_name TEXT NOT NULL,

    toss_winner TEXT,
    toss_decision TEXT,

    match_status TEXT NOT NULL,

    result_type TEXT,
    result_summary TEXT,

    notes TEXT,

    created_at TEXT,
    updated_at TEXT,
    deleted_at TEXT,

    synced_at TEXT,
    dirty INTEGER DEFAULT 0
);
`;

export const CREATE_PLAYERS_TABLE = `
CREATE TABLE IF NOT EXISTS players (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    organization TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    guest_of_player_id TEXT,
    status TEXT NOT NULL,
    total_contribution TEXT NOT NULL,
    total_expense TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
`;