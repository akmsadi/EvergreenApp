import { router, useLocalSearchParams } from "expo-router";

import PlayerForm from "../forms/PlayerForm";

import { usePlayerStore } from "../../../stores/playerStore";

export default function AddPlayer() {
    const { teamId } = useLocalSearchParams();

    const addPlayer = usePlayerStore((s) => s.addPlayer);

    return (
        <PlayerForm
            initialValues={{
                teamId: Number(teamId),
            }}
            onSubmit={(player) => {
                addPlayer({
                    id: Date.now(),

                    ...player,
                });

                router.back();
            }}
        />
    );
}
