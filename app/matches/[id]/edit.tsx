import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Alert } from "react-native";

import AppHeader from "@/components/AppHeader";
import MatchEditor from "@/components/MatchEditor";
import { MatchModel } from "@/database/models/MatchModel";
import MatchRepository from "@/database/repositories/MatchRepository";

export default function EditMatch() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();

    if (!id) {
        return null;
    }

    const match = MatchRepository.find(Number(id));

    if (!match) {
        Alert.alert("Error", "Match not found.");
        router.back();
        return null;
    }

    const save = (updatedMatch: MatchModel) => {
        MatchRepository.save(updatedMatch);
        router.back();
    };

    const addPlayers = (matchId: number) => {
        router.push(`/matches/${matchId}/players`);
    };

    return (
        <>
            <AppHeader title='Edit Match' showBack />

            <MatchEditor initialMatch={match} onSave={save} onAddPlayers={addPlayers} />
        </>
    );
}
