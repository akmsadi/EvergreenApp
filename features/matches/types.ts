export type MatchFormat = "T10" | "T20" | "ODI" | "TEST";

export type TossDecision = "BAT" | "BOWL";

export interface Match {

    id: number;

    name: string;

    format: MatchFormat;

    overs: number;

    teamAId: number;

    teamBId: number;

    tossWinnerId?: number;

    tossDecision?: TossDecision;

    battingTeamId?: number;

    bowlingTeamId?: number;

    status: "NEW" | "LIVE" | "COMPLETED";

    createdAt: number;

}