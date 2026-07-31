export interface MatchModel {
    id: number;
    server_id: number | null;

    match_type: string;
    format_overs: number;

    venue: string | null;
    venue_id: number | null;

    scheduled_at: string | null;

    team_name: string;
    opponent_name: string;

    toss_winner: string | null;
    toss_decision: string | null;

    match_status: string;

    result_type: string | null;
    result_summary: string | null;

    notes: string | null;

    created_at: string | null;
    updated_at: string | null;
    deleted_at: string | null;

    from_admin: number;
    synced_at: string | null;
    dirty: number;
}

export interface ScheduledMatchPlayer {
    player_id: string;
    is_captain: boolean;
}

export interface ScheduledMatchModel extends MatchModel {
    team_a_players?: ScheduledMatchPlayer[];
    team_b_players?: ScheduledMatchPlayer[];
}