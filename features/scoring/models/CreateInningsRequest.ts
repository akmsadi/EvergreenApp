export interface CreateInningsRequest {

    matchId: number;

    battingTeam: "team_a" | "team_b";

    bowlingTeam: "team_a" | "team_b";

    strikerId: number;

    nonStrikerId: number;

    bowlerId: number;

    maxOvers: number;

}