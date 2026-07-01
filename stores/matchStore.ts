import { create } from "zustand";
import { Match } from "../features/matches/types";

interface MatchStore {

    currentMatch: Match | null;

    setCurrentMatch: (match: Match) => void;

    clearMatch: () => void;

}

export const useMatchStore = create<MatchStore>((set) => ({

    currentMatch: null,

    setCurrentMatch: (match) =>
        set({
            currentMatch: match,
        }),

    clearMatch: () =>
        set({
            currentMatch: null,
        }),

}));