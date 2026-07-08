export interface DeliveryModel {
    id?: number;
    innings_id: number;
    over_no: number;
    ball_no: number;
    batsman_id: string;
    non_striker_id: string;
    bowler_id: string;
    runs_off_bat: number;
    extra_type?: string | null;
    extra_runs: number;
    total_runs: number;
    is_wicket: boolean;
    dismissal_type?: string | null;
    dismissed_player_id?: string | null;
    fielder_id?: string | null;
    legal_ball: boolean;
    created_at?: string;
}