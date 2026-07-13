import AppHeader from "@/components/AppHeader";
import { Colors } from "@/constants/colors";
import { Spacing } from "@/constants/spacing";
import { MatchModel } from "@/database/models/MatchModel";
import MatchRepository from "@/database/repositories/MatchRepository";
import ScoreEngine from "@/features/scoring/engine/ScoreEngine";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, FAB } from "react-native-paper";

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
        <View style={styles.container}>
            <AppHeader title='🏏 Evergreen Scorer' />
            <ScrollView style={styles.scheduledContainer} contentContainerStyle={styles.scheduledContent} showsVerticalScrollIndicator={false}>
                {scheduledMatches.length > 0 ? (
                    scheduledMatches.map((match) => (
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
                    ))
                ) : (
                    <Text style={styles.noMatches}>No scheduled matches found.</Text>
                )}
            </ScrollView>

            <FAB icon='plus' label='New Match' size='small' onPress={() => router.push("/matches/add")} style={styles.fab} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },

    sectionTitle: {
        fontSize: 22,

        fontWeight: "700",

        paddingHorizontal: Spacing.defaultSpace,

        marginTop: 12,

        marginBottom: 8,
    },

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

    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    formatBadge: {
        backgroundColor: "#3949AB",
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
    },

    formatText: {
        color: "#FFF",
        fontWeight: "700",
    },

    statusBadge: {
        backgroundColor: "#43A047",
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
    },

    statusText: {
        color: "#FFF",
        fontWeight: "700",
    },

    teamsContainer: {
        alignItems: "center",
        marginVertical: 22,
    },

    vs: {
        fontSize: 18,
        color: "#888",
        marginVertical: 10,
        fontWeight: "700",
    },

    infoContainer: {
        marginBottom: 18,
    },

    info: {
        fontSize: 14,
        color: "#555",
        marginBottom: 5,
    },

    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    fab: {
        position: "absolute",
        right: 20,
        bottom: 20,
    },

    matchCard: {
        backgroundColor: Colors.white,
        borderRadius: 8,
        marginBottom: 18,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: {
            width: 0,
            height: 3,
        },
        elevation: 4,
        borderWidth: 1,
        borderColor: Colors.darkGray,
    },

    teamRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        paddingVertical: 24,
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
        borderWidth: 2,
        borderColor: Colors.primary,
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 8,
    },

    vsText: {
        fontWeight: "700",
        fontSize: 18,
        color: Colors.primary,
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
