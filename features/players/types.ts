export type BattingStyle =
    | "Right Hand Bat"
    | "Left Hand Bat";

export type BowlingStyle =
    | "Right Arm Fast"
    | "Left Arm Fast"
    | "Right Arm Medium"
    | "Left Arm Medium"
    | "Right Arm Off Spin"
    | "Left Arm Orthodox"
    | "Right Arm Leg Spin"
    | "Left Arm Chinaman"
    | "None";

export interface Player {

    id: number;

    teamId: number;

    firstName: string;

    lastName: string;

    jerseyNumber: number;

    battingStyle: BattingStyle;

    bowlingStyle: BowlingStyle;

    battingPosition: number;

    isCaptain: boolean;

    isWicketKeeper: boolean;
}