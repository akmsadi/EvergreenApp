export interface MatchPlayerModel {
    match_id: number;
    player_id: number;
    team: "team_a" | "team_b";
    is_captain: number;
    created_at: string | null;
    updated_at: string | null;
}
