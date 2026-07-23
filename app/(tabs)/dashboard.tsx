import AppContainer from "@/components/AppContainer";
import AppHeader from "@/components/AppHeader";
import { Colors } from "@/constants/colors";
import { Spacing } from "@/constants/spacing";
import { MatchModel } from "@/database/models/MatchModel";
import MatchRepository from "@/database/repositories/MatchRepository";
import ScoreEngine from "@/features/scoring/engine/ScoreEngine";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { Button, FAB, Text } from "react-native-paper";

export default function DashboardScreen() {
    const router = useRouter();
    const [scheduledMatches, setScheduledMatches] = useState<MatchModel[]>([]);

    const refreshCounts = useCallback(() => {
        setScheduledMatches(MatchRepository.getByStatus("scheduled"));
    }, []);

    useFocusEffect(
        useCallback(() => {
            refreshCounts();
        }, [refreshCounts]),
    );

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
        <AppContainer>
            <AppHeader />
            <ScrollView style={styles.scheduledContainer} contentContainerStyle={styles.scheduledContent} showsVerticalScrollIndicator={false}>
                {scheduledMatches.length > 0 ? (
                    <>
                        <Text variant='titleLarge' style={{ marginBottom: Spacing.defaultSpace }}>
                            Matches
                        </Text>
                        {scheduledMatches.map((match) => (
                            <View key={match.id} style={styles.matchCard}>
                                {/* Teams */}
                                <View style={styles.teamRow}>
                                    <View style={styles.teamBlock}>
                                        <View style={styles.logo}>
                                            <Text style={styles.logoText}>🏏</Text>
                                        </View>

                                        <Text numberOfLines={2} style={styles.teamName}>
                                            {match.team_name}
                                        </Text>
                                    </View>

                                    <View style={styles.vsCircle}>
                                        <Text style={styles.vsText}>VS</Text>
                                    </View>

                                    <View style={styles.teamBlock}>
                                        <View style={styles.logo}>
                                            <Text style={styles.logoText}>🏏</Text>
                                        </View>

                                        <Text numberOfLines={2} style={styles.teamName}>
                                            {match.opponent_name}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.infoRow}>
                                    <View style={styles.infoColumn}>
                                        <Text style={styles.matchSubTitle}>
                                            {match.match_type.toUpperCase()} • {match.format_overs} Overs
                                        </Text>
                                    </View>

                                    <View style={styles.infoColumn}>
                                        <Text style={styles.venue}>📍 {match.venue || "TBA"}</Text>
                                    </View>
                                </View>

                                <View style={styles.divider} />

                                <View style={styles.actionRow}>
                                    <View style={styles.actionItem}>
                                        <Button
                                            mode='text'
                                            icon='pencil'
                                            contentStyle={styles.buttonContent}
                                            style={styles.fullButton}
                                            onPress={() => router.push(`/matches/${match.id}/edit`)}
                                        >
                                            Edit
                                        </Button>
                                    </View>

                                    <View style={styles.verticalDivider} />

                                    <View style={styles.actionItem}>
                                        <Button
                                            mode='text'
                                            icon='delete'
                                            textColor='#D32F2F'
                                            contentStyle={styles.buttonContent}
                                            style={styles.fullButton}
                                            onPress={() => handleDeleteMatch(match.id)}
                                        >
                                            Delete
                                        </Button>
                                    </View>

                                    <View style={styles.verticalDivider} />

                                    <View style={styles.actionItem}>
                                        <Button
                                            mode='text'
                                            icon='play'
                                            contentStyle={styles.buttonContent}
                                            style={styles.fullButton}
                                            onPress={() => handleStartMatch(match.id)}
                                        >
                                            Start
                                        </Button>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </>
                ) : (
                    <Text style={styles.noMatches}>No scheduled matches found.</Text>
                )}
            </ScrollView>

            <FAB icon='plus' label='New Match' size='small' onPress={() => router.push("/matches/add")} style={styles.fab} />
        </AppContainer>
    );
}

const styles = StyleSheet.create({
    noMatches: {
        textAlign: "center",
        color: "#777",
        marginTop: 16,
        fontStyle: "italic",
    },

    scheduledContainer: {
        flex: 1,
    },

    scheduledContent: {
        padding: 16,
        paddingBottom: 100,
    },

    fab: {
        position: "absolute",
        right: 20,
        bottom: 20,
    },

    matchCard: {
        backgroundColor: Colors.white,
        borderRadius: 8,
        elevation: 8,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },

    teamRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        paddingVertical: Spacing.defaultSpace,
    },

    teamBlock: {
        alignItems: "center",
        flex: 1,
    },

    logo: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: Colors.background,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
    },

    logoText: {
        fontSize: 28,
    },

    teamName: {
        textAlign: "center",
        fontSize: 18,
        fontWeight: "700",
        paddingHorizontal: 8,
    },

    vsCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 8,
        backgroundColor: Colors.secondary,
    },

    vsText: {
        fontWeight: "700",
        fontSize: 18,
        color: Colors.white,
    },

    matchDate: {
        textAlign: "center",
        fontSize: 16,
        fontWeight: "700",
        marginTop: 16,
    },

    divider: {
        height: 1,
        backgroundColor: Colors.darkGray,
    },

    actionRow: {
        flexDirection: "row",
        alignItems: "stretch",
    },

    actionItem: {
        flex: 1,
    },

    verticalDivider: {
        width: 1,
        backgroundColor: Colors.darkGray,
    },

    fullButton: {
        borderRadius: 0,
        margin: 0,
    },

    buttonContent: {
        height: 52,
    },

    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },

    infoColumn: {
        flex: 1,
    },

    matchSubTitle: {
        fontSize: 14,
        color: "#666",
        fontWeight: "600",
    },

    venue: {
        fontSize: 14,
        color: "#666",
        fontWeight: "600",
        textAlign: "right",
    },
});
