import { create } from "zustand";
import { Team } from "../features/teams/types";

interface TeamStore {

    teams: Team[];

    getTeam: (id: number) => Team | undefined;

    addTeam: (team: Omit<Team, "id">) => void;

    updateTeam: (team: Team) => void;

    deleteTeam: (id: number) => void;

}

export const useTeamStore = create<TeamStore>((set, get) => ({

    teams: [],

    getTeam: (id) => get().teams.find(team => team.id === id),

    addTeam: (team) =>
        set((state) => ({

            teams: [

                ...state.teams,

                {

                    id: Date.now(),

                    ...team,

                },

            ],

        })),

    updateTeam: (team) =>
        set((state) => ({

            teams: state.teams.map((item) =>
                item.id === team.id ? team : item
            ),

        })),

    deleteTeam: (id) =>
        set((state) => ({

            teams: state.teams.filter(
                (item) => item.id !== id
            ),

        })),

}));