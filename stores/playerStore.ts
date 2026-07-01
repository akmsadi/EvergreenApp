import { create } from "zustand";
import { Player } from "../features/players/types";

interface PlayerStore {

    players: Player[];

    addPlayer(player: Player): void;

    updatePlayer(player: Player): void;

    deletePlayer(id: number): void;

    getPlayersByTeam(teamId: number): Player[];

    getPlayer(id: number): Player | null;
}

export const usePlayerStore =
    create<PlayerStore>((set, get) => ({

        players: [],

        addPlayer: (player) =>
            set((state) => ({
                players: [...state.players, player],
            })),

        updatePlayer: (player) =>
            set((state) => ({
                players: state.players.map((p) =>
                    p.id === player.id ? player : p
                ),
            })),

        deletePlayer: (id) =>
            set((state) => ({
                players: state.players.filter(
                    (p) => p.id !== id
                ),
            })),

        getPlayersByTeam: (teamId) =>
            get()
                .players
                .filter((p) => p.teamId === teamId)
                .sort((a, b) => a.battingPosition - b.battingPosition),

        getPlayer: (id) =>
            get().players.find((p) => p.id === id) ?? null,

    }));