export interface InningsBattingModel {

    innings_id: number;

    player_id: string;

    batting_position: number;

    runs: number;

    balls: number;

    fours: number;

    sixes: number;

    is_out: boolean;

    dismissal_type?: string;

    bowler_id?: string;

    fielder_id?: string;

}