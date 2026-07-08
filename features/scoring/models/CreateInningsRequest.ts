export interface CreateInningsRequest {

    matchId: number;

    battingTeam: "team_a" | "team_b";

    bowlingTeam: "team_a" | "team_b";

    strikerId: string;

    nonStrikerId: string;

    bowlerId: string;

    maxOvers: number;

}