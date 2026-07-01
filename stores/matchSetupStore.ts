import { create } from "zustand";

export type WizardStep =
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7;

interface MatchSetupState {

    step: WizardStep;

    matchName: string;

    format: "T10" | "T20" | "ODI" | "TEST";

    overs: number;

    teamAId?: number;

    teamBId?: number;

    teamAPlayers: number[];

    teamBPlayers: number[];

    tossWinnerId?: number;

    tossDecision?: "BAT" | "BOWL";

    strikerId?: number;

    nonStrikerId?: number;

    bowlerId?: number;

}

interface MatchSetupActions {

    next(): void;

    previous(): void;

    setTeamA(id: number): void;

    setTeamB(id: number): void;

    goto(step: WizardStep): void;

    setMatchName(name: string): void;

    setFormat(format: MatchSetupState["format"]): void;

    setOvers(overs: number): void;

    setTeamA(id: number): void;

    setTeamB(id: number): void;

    reset(): void;

    clearTeams(): void;

    teamAPlayingXI: number[];

    teamBPlayingXI: number[];

    setTeamAPlayingXI(players: number[]): void;

    setTeamBPlayingXI(players: number[]): void;

}

export const useMatchSetupStore =
    create<MatchSetupState & MatchSetupActions>(
        (set) => ({

            step: 1,

            matchName: "",

            format: "T20",

            overs: 20,

            teamAPlayers: [],

            teamBPlayers: [],

            next: () => set((s) => ({

                step: Math.min(7, s.step + 1) as WizardStep

            })),

            previous: () =>
                set((state) => ({
                    step: Math.max(1, state.step - 1) as WizardStep,
                })),

            goto: (step) => set({ step }),

            setMatchName: (matchName) => set({ matchName }),

            setFormat: (format) => set({ format }),

            setOvers: (overs) => set({ overs }),

            setTeamA: (id) =>
                set({
                    teamAId: id,
                }),

            setTeamB: (id) =>
                set({
                    teamBId: id,
                }),

            clearTeams: () =>
                set({
                    teamAId: undefined,
                    teamBId: undefined,
                }),

            reset: () => set({

                step: 1,

                matchName: "",

                format: "T20",

                overs: 20,

                teamAPlayers: [],

                teamBPlayers: []

            }),

            teamAPlayingXI: [],

            teamBPlayingXI: [],

            setTeamAPlayingXI: (players) =>

                set({

                    teamAPlayingXI: players

                }),

            setTeamBPlayingXI: (players) =>

                set({

                    teamBPlayingXI: players

                }),

        }));