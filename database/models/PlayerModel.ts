export interface PlayerModel {
    id: number;
    name: string;
    organization: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    guest_of_player_id: number | null;
    status: string;
    total_contribution: number;
    total_expense: number;
    created_at: string;
    updated_at: string;
}