export interface PlayerModel {
    id: string;
    server_id: number | null;
    name: string;
    organization: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    guest_of_player_id: string | null;
    guest_of_player_name: string | null;
    status: string;
    total_contribution: number;
    total_expense: number;
    created_at: string;
    updated_at: string;
}