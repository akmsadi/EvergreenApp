export type MatchFormat = "T10" | "T20" | "ODI" | "TEST" | "CUSTOM";

export interface Team {

    id: number;

    name: string;

}

export interface MatchState {

    matchId?: number;

    format: MatchFormat;

    overs: number;

    teamA?: Team;

    teamB?: Team;

    tossWinner?: number;

    electedTo?: "BAT" | "BOWL";

    battingTeam?: Team;

    bowlingTeam?: Team;

    innings: number;

    isStarted: boolean;

    isCompleted: boolean;

}