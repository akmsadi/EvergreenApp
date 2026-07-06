export interface DeliveryModel {
    id?: number;
    innings_id: number;
    over_no: number;
    ball_no: number;
    batsman_id: number;
    non_striker_id: number;
    bowler_id: number;
    runs_off_bat: number;
    extra_type?: string | null;
    extra_runs: number;
    total_runs: number;
    is_wicket: boolean;
    dismissal_type?: string | null;
    dismissed_player_id?: number | null;
    fielder_id?: number | null;
    legal_ball: boolean;
    created_at?: string;
}