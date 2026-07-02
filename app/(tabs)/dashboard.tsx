import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

import AppHeader from "@/components/AppHeader";
import DashboardCard from "@/components/DashboardCard";
import { Spacing } from "@/constants/spacing";
import MatchRepository from "@/database/repositories/MatchRepository";
import PlayerRepository from "@/database/repositories/PlayerRepository";
import SyncService from "@/services/SyncService";

export default function DashboardScreen() {
    const router = useRouter();
    const [matchCount, setMatchCount] = useState<number>(0);
    const [playerCount, setPlayerCount] = useState<number>(0);

    useEffect(() => {
        setMatchCount(MatchRepository.getCount());
        setPlayerCount(PlayerRepository.getCount());
    }, []);

    const syncMatches = async () => {
        try {
            const count = await SyncService.syncMatches();
            setMatchCount(MatchRepository.getCount());
            Alert.alert("Sync Complete", `${count} matches synchronized successfully.`);
        } catch (error) {
            Alert.alert("Sync Failed", error instanceof Error ? error.message : "Unknown error");
        }
    };

    const syncPlayers = async () => {
        try {
            const count = await SyncService.syncPlayers();
            setPlayerCount(PlayerRepository.getCount());
            Alert.alert("Sync Complete", `${count} players synchronized successfully.`);
        } catch (error) {
            Alert.alert("Sync Failed", error instanceof Error ? error.message : "Unknown error");
        }
    };

    return (
        <View style={styles.container}>
            <AppHeader title='Evergreen scorer' />
            <View style={styles.grid}>
                <DashboardCard title={`Matches (${matchCount})`} icon='cricket' onPress={() => router.push("/matches")} onSync={syncMatches} />
                <DashboardCard title={`Players (${playerCount})`} icon='account' onPress={() => router.push("/players")} onSync={syncPlayers} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },

    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        paddingHorizontal: Spacing.defaultSpace,
    },

    card: {
        width: "48%",
        marginBottom: 16,
    },
});
