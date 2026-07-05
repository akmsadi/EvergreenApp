import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Alert, StyleSheet, View } from "react-native";

import AppHeader from "@/components/AppHeader";
import MatchEditor from "@/components/MatchEditor";
import { Colors } from "@/constants/colors";
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
        <View style={styles.container}>
            <AppHeader title='Edit Match' showBack />
            <MatchEditor initialMatch={match} onSave={save} onAddPlayers={addPlayers} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
});
