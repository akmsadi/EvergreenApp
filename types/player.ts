export interface Player {
    id: number;
    teamId: number;
    name: string;
    isCaptain: boolean;
    isWicketKeeper: boolean;

}

export interface PlayerIDs {
    id: string;
    server_id: number;
}