import { Team } from "../../features/teams/types";

export interface ITeamRepository {
    getAll(): Promise<Team[]>;

    get(id: number): Promise<Team | null>;

    insert(team: Omit<Team, "id">): Promise<Team>;

    update(team: Team): Promise<void>;

    delete(id: number): Promise<void>;
}