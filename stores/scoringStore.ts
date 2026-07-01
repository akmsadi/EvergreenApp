import { create } from "zustand";

import { BallEvent } from "../database/models/BallModel";

interface ScoringStore {

    balls: BallEvent[];

    addBall: (ball: BallEvent) => void;

    undoBall: () => void;

    clear: () => void;

}

export const useScoringStore = create<ScoringStore>((set) => ({

    balls: [],

    addBall: (ball) =>

        set((state) => ({

            balls: [
                ...state.balls,
                ball
            ]

        })),

    undoBall: () =>

        set((state) => ({

            balls: state.balls.slice(0, -1)

        })),

    clear: () =>

        set({

            balls: []

        })

}));