import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";

import AppHeader from "@/components/AppHeader";
import DashboardCard from "@/components/DashboardCard";
import { Spacing } from "@/constants/spacing";
import { MatchModel } from "@/database/models/MatchModel";
import MatchRepository from "@/database/repositories/MatchRepository";
import PlayerRepository from "@/database/repositories/PlayerRepository";
import ScoreEngine from "@/features/scoring/engine/ScoreEngine";
import SyncService from "@/services/SyncService";
import { formatDisplayDate } from "@/utils/Common";

export default function DashboardScreen() {
    const router = useRouter();
    const [matchCount, setMatchCount] = useState<number>(0);
    const [playerCount, setPlayerCount] = useState<number>(0);
    const [scheduledMatches, setScheduledMatches] = useState<MatchModel[]>([]);

    const refreshCounts = useCallback(() => {
        setMatchCount(MatchRepository.getCount());
        setPlayerCount(PlayerRepository.getCount());
        setScheduledMatches(MatchRepository.getByStatus("scheduled"));
    }, []);

    useFocusEffect(
        useCallback(() => {
            refreshCounts();
        }, [refreshCounts]),
    );

    const syncMatches = async () => {
        try {
            const count = await SyncService.syncMatches();
            refreshCounts();
            Alert.alert("Sync Complete", `${count} matches synchronized successfully.`);
        } catch (error) {
            Alert.alert("Sync Failed", error instanceof Error ? error.message : "Unknown error");
        }
    };

    const syncPlayers = async () => {
        try {
            const count = await SyncService.syncPlayers();
            refreshCounts();
            Alert.alert("Sync Complete", `${count} players synchronized successfully.`);
        } catch (error) {
            Alert.alert("Sync Failed", error instanceof Error ? error.message : "Unknown error");
        }
    };

    const fetchScheduledMatches = async () => {
        try {
            const count = await SyncService.syncScheduledMatches();
            refreshCounts();
            Alert.alert("Sync Complete", `${count} scheduled matches synchronized successfully.`);
        } catch (error) {
            Alert.alert("Sync Failed", error instanceof Error ? error.message : "Unknown error");
        }
    };

    const handleDeleteMatch = (matchId: number) => {
        Alert.alert("Delete match", "Are you sure you want to delete this match and its player assignments?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: () => {
                    MatchRepository.delete(matchId);
                    refreshCounts();
                },
            },
        ]);
    };

    const handleStartMatch = async (matchId: number) => {
        try {
            const resumed = await ScoreEngine.resumeMatch(matchId);

            if (resumed) {
                router.push("/scoring");
                return;
            }

            router.push(`/matches/${matchId}/start`);
        } catch (error) {
            Alert.alert("Unable to start", error instanceof Error ? error.message : "Unknown error");
        }
    };

    return (
        <View style={styles.container}>
            <AppHeader title='Evergreen Scorer' />

            <View style={styles.scheduledContainer}>
                {scheduledMatches.length > 0 ? (
                    scheduledMatches.map((match) => (
                        <View key={match.id} style={styles.matchCard}>
                            {/* Row 1 */}
                            <View style={styles.row}>
                                <Text style={styles.matchTitle}>
                                    {match.team_name} vs {match.opponent_name}
                                </Text>

                                <Text style={styles.matchDate}>{formatDisplayDate(new Date(match.scheduled_at ?? ""))}</Text>
                            </View>

                            {/* Row 2 */}
                            <View style={styles.row}>
                                <Text style={styles.matchInfo}>
                                    {match.match_type.toUpperCase()} • {match.format_overs} Overs
                                </Text>

                                <Text style={styles.matchStatus}>{match.match_status}</Text>
                            </View>

                            {/* Row 3 */}
                            <View style={styles.buttonRow}>
                                <View style={styles.buttonWrapper}>
                                    <Button mode='contained-tonal' icon='pencil' onPress={() => router.push(`/matches/${match.id}/edit`)}>
                                        Edit
                                    </Button>
                                </View>
                                <View style={styles.buttonWrapper}>
                                    <Button mode='contained-tonal' icon='delete' buttonColor='#d32f2f' onPress={() => handleDeleteMatch(match.id)}>
                                        Delete
                                    </Button>
                                </View>
                                <View style={styles.buttonWrapper}>
                                    <Button mode='contained' icon='play' onPress={() => handleStartMatch(match.id)}>
                                        Start
                                    </Button>
                                </View>
                            </View>
                        </View>
                    ))
                ) : (
                    <Text style={styles.noMatches}>No scheduled matches found.</Text>
                )}
            </View>

            <View style={styles.bottomButtons}>
                <View style={styles.grid}>
                    <DashboardCard title={`Matches (${matchCount})`} icon='cricket' onPress={() => router.push("/matches")} onSync={syncMatches} />

                    <DashboardCard title={`Players (${playerCount})`} icon='account' onPress={() => router.push("/players")} onSync={syncPlayers} />
                </View>
                <Button mode='contained' icon='cloud-download' onPress={() => router.push("/scoring")} style={styles.button}>
                    Scoring
                </Button>
                <View style={[styles.buttonRow, { marginTop: 0 }]}>
                    <View style={styles.buttonWrapper}>
                        <Button mode='contained' icon='cloud-download' onPress={fetchScheduledMatches} style={styles.button}>
                            Get Matches
                        </Button>
                    </View>
                    <View style={styles.buttonWrapper}>
                        <Button mode='contained-tonal' icon='plus' onPress={() => router.push("/matches/add")} style={styles.button}>
                            Create New
                        </Button>
                    </View>
                </View>
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
        paddingTop: Spacing.defaultSpace,
    },

    bottomButtons: {
        paddingHorizontal: Spacing.defaultSpace,
        borderTopWidth: 1,
        borderTopColor: "#eee",
        backgroundColor: "#fff",
        marginTop: "auto",
    },

    button: {
        marginBottom: 10,
    },

    scheduledContainer: {
        paddingHorizontal: Spacing.defaultSpace,
    },

    scheduledItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },

    noMatches: {
        textAlign: "center",
        color: "#777",
        marginTop: 16,
        fontStyle: "italic",
    },

    matchCard: {
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        backgroundColor: "#fff",
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },

    matchTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: "600",
    },

    matchDate: {
        color: "#666",
        marginLeft: 12,
    },

    matchInfo: {
        color: "#666",
    },

    matchStatus: {
        color: "#1976d2",
        fontWeight: "500",
    },

    buttonRow: {
        flexDirection: "row",
        marginTop: 10,
        gap: 8, // React Native 0.71+ / Expo SDK 54
    },

    buttonWrapper: {
        flex: 1,
    },
});
