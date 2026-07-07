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
    from_admin INTEGER NOT NULL DEFAULT 1,
    synced_at TEXT,
    dirty INTEGER DEFAULT 0
);
`;

export const CREATE_PLAYERS_TABLE = `
CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY,
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

export const CREATE_VENUES_TABLE = `
CREATE TABLE IF NOT EXISTS venues (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TEXT,
    updated_at TEXT,
    deleted_at TEXT,
    synced_at TEXT
);
`;

export const CREATE_MATCH_PLAYERS_TABLE = `
CREATE TABLE IF NOT EXISTS match_players (
    match_id INTEGER NOT NULL,
    player_id INTEGER NOT NULL,
    team TEXT NOT NULL,
    batting_position INTEGER,
    bowling_position INTEGER,
    is_playing_xi INTEGER NOT NULL DEFAULT 1,
    is_captain INTEGER NOT NULL DEFAULT 0,
    created_at TEXT,
    updated_at TEXT,
    PRIMARY KEY (match_id, player_id)
);
`;

export const CREATE_INNINGS_TABLE = `
CREATE TABLE IF NOT EXISTS innings (
    id INTEGER PRIMARY KEY,
    match_id INTEGER NOT NULL,
    innings_number INTEGER NOT NULL,
    batting_team TEXT NOT NULL,
    bowling_team TEXT NOT NULL,
    max_overs INTEGER NOT NULL,
    target_runs INTEGER,
    total_runs INTEGER NOT NULL DEFAULT 0,
    wickets INTEGER NOT NULL DEFAULT 0,
    legal_balls INTEGER NOT NULL DEFAULT 0,
    extras INTEGER NOT NULL DEFAULT 0,
    is_completed INTEGER NOT NULL DEFAULT 0,
    created_at TEXT,
    updated_at TEXT
);
`;

export const CREATE_DELIVERIES_TABLE = `
CREATE TABLE IF NOT EXISTS deliveries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    innings_id INTEGER NOT NULL,
    over_no INTEGER NOT NULL,
    ball_no INTEGER NOT NULL,
    batsman_id INTEGER NOT NULL,
    non_striker_id INTEGER NOT NULL,
    bowler_id INTEGER NOT NULL,
    runs_off_bat INTEGER NOT NULL DEFAULT 0,
    extra_type TEXT,
    extra_runs INTEGER NOT NULL DEFAULT 0,
    total_runs INTEGER NOT NULL DEFAULT 0,
    is_wicket INTEGER NOT NULL DEFAULT 0,
    dismissal_type TEXT,
    dismissed_player_id INTEGER,
    fielder_id INTEGER,
    legal_ball INTEGER NOT NULL DEFAULT 1,
    created_at TEXT
);
`;

export const CREATE_BATTING_SCORES_TABLE = `
CREATE TABLE IF NOT EXISTS batting_scores (
    innings_id INTEGER,
    player_id INTEGER,
    runs INTEGER DEFAULT 0,
    balls INTEGER DEFAULT 0,
    fours INTEGER DEFAULT 0,
    sixes INTEGER DEFAULT 0,
    strike_rate REAL DEFAULT 0,
    is_out INTEGER DEFAULT 0,
    dismissal_type TEXT,
    bowler_id INTEGER,
    fielder_id INTEGER,
    PRIMARY KEY (innings_id, player_id)
);
`;

export const CREATE_BOWLING_FIGURES_TABLE = `
CREATE TABLE IF NOT EXISTS bowling_figures (
    innings_id INTEGER,
    player_id INTEGER,
    overs INTEGER DEFAULT 0,
    balls INTEGER DEFAULT 0,
    maidens INTEGER DEFAULT 0,
    runs INTEGER DEFAULT 0,
    wickets INTEGER DEFAULT 0,
    wides INTEGER DEFAULT 0,
    noballs INTEGER DEFAULT 0,
    economy REAL DEFAULT 0,
    PRIMARY KEY (innings_id, player_id)
);
`;

export const CREATE_PARTNERSHIPS_TABLE = `
CREATE TABLE IF NOT EXISTS partnerships (
    id INTEGER PRIMARY KEY,
    innings_id INTEGER,
    batsman1_id INTEGER,
    batsman2_id INTEGER,
    runs INTEGER,
    balls INTEGER,
    wicket_no INTEGER
);
`;

export const CREATE_FALL_OF_WICKETS_TABLE = `
CREATE TABLE IF NOT EXISTS fall_of_wickets (
    id INTEGER PRIMARY KEY,
    innings_id INTEGER,
    wicket_no INTEGER,
    score INTEGER,
    over_no REAL,
    player_id INTEGER
);
`;

export const CREATE_CURRENT_INNINGS_TABLE = `
CREATE TABLE IF NOT EXISTS current_innings (
    innings_id INTEGER PRIMARY KEY,
    striker_id INTEGER NOT NULL,
    non_striker_id INTEGER NOT NULL,
    bowler_id INTEGER NOT NULL,
    next_batsman_position INTEGER NOT NULL DEFAULT 3,
    updated_at TEXT
);
`;

export const CREATE_INNINGS_START_TABLE = `
CREATE TABLE IF NOT EXISTS innings_start (
    innings_id INTEGER PRIMARY KEY,
    striker_id INTEGER NOT NULL,
    non_striker_id INTEGER NOT NULL,
    bowler_id INTEGER NOT NULL
);
`;

export const CREATE_INNINGS_BATTING_TABLE = `
CREATE TABLE IF NOT EXISTS innings_batting (
    innings_id INTEGER NOT NULL,
    player_id INTEGER NOT NULL,
    batting_position INTEGER NOT NULL,
    runs INTEGER NOT NULL DEFAULT 0,
    balls INTEGER NOT NULL DEFAULT 0,
    fours INTEGER NOT NULL DEFAULT 0,
    sixes INTEGER NOT NULL DEFAULT 0,
    is_out INTEGER NOT NULL DEFAULT 0,
    dismissal_type TEXT,
    fielder_id INTEGER,
    bowler_id INTEGER,
    PRIMARY KEY (innings_id, player_id)
);
`;

export const CREATE_INNINGS_BOWLING_TABLE = `
CREATE TABLE IF NOT EXISTS innings_bowling (
    innings_id INTEGER NOT NULL,
    player_id INTEGER NOT NULL,
    balls INTEGER NOT NULL DEFAULT 0,
    maidens INTEGER NOT NULL DEFAULT 0,
    runs INTEGER NOT NULL DEFAULT 0,
    wickets INTEGER NOT NULL DEFAULT 0,
    wides INTEGER NOT NULL DEFAULT 0,
    no_balls INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (innings_id, player_id)
);
`;