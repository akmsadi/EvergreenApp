export interface InningsBattingModel {

    innings_id: number;

    player_id: number;

    batting_position: number;

    runs: number;

    balls: number;

    fours: number;

    sixes: number;

    is_out: boolean;

    dismissal_type?: string;

    bowler_id?: number;

    fielder_id?: number;

}