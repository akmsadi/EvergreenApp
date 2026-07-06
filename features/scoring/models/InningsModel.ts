export interface InningsModel {
    id?: number;
    match_id: number;
    innings_number: number;
    batting_team: "team_a" | "team_b";
    bowling_team: "team_a" | "team_b";
    max_overs: number;
    target_runs?: number;
    total_runs: number;
    wickets: number;
    legal_balls: number;
    extras: number;
    is_completed: boolean;
    created_at?: string;
    updated_at?: string;
}