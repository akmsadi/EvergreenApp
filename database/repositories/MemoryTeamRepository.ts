import { Team } from "../../features/teams/types";
import { ITeamRepository } from "./TeamRepository";

export class MemoryTeamRepository
    implements ITeamRepository {
    private teams: Team[] = [];

    async getAll() {
        return this.teams;
    }

    async get(id: number) {
        return (
            this.teams.find((t) => t.id === id) ?? null
        );
    }

    async insert(team: Omit<Team, "id">) {
        const item: Team = {
            id: Date.now(),
            ...team,
        };

        this.teams.push(item);

        return item;
    }

    async update(team: Team) {
        this.teams = this.teams.map((t) =>
            t.id === team.id ? team : t
        );
    }

    async delete(id: number) {
        this.teams = this.teams.filter(
            (t) => t.id !== id
        );
    }
}