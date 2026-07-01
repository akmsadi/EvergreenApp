import { MemoryTeamRepository } from "../../../database/repositories/MemoryTeamRepository";

class TeamService {

    repository =
        new MemoryTeamRepository();

    async all() {

        return this.repository.getAll();

    }

    async create(name: string, shortName: string) {

        return this.repository.insert({

            name,

            shortName,

        });

    }

}

export default new TeamService();