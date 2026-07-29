import AppHeader from "@/components/AppHeader";
import { Colors } from "@/constants/colors";
import { Spacing } from "@/constants/spacing";
import { MatchModel } from "@/database/models/MatchModel";
import MatchPlayerRepository from "@/database/repositories/MatchPlayerRepository";
import MatchRepository from "@/database/repositories/MatchRepository";
import ScoreEngine from "@/features/scoring/engine/ScoreEngine";
import { formatDate } from "@/utils/Common";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, FlatList, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

function MatchCard({ match, onDelete, onCopy }: { match: MatchModel; onDelete: (id: number) => void; onCopy: (id: number) => void }) {
    const router = useRouter();

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
        <View style={styles.matchCard}>
            {/* Header */}
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.date}>{formatDate(match.scheduled_at)}</Text>

                    <Text style={styles.tournament}>
                        {match.match_type.toUpperCase()} • {match.venue}
                    </Text>
                </View>

                <View
                    style={[
                        styles.statusBadge,
                        {
                            backgroundColor: match.match_status === "scheduled" ? "#E53935" : "#43A047",
                        },
                    ]}
                >
                    <Text style={styles.statusText}>{match.match_status.toUpperCase()}</Text>
                </View>
            </View>

            <View style={styles.divider} />

            {/* Teams */}
            <View style={styles.teamRow}>
                <View style={styles.team}>
                    <Text style={styles.flag}>🏏</Text>
                    <Text style={styles.teamName}>{match.team_name}</Text>
                </View>
                <Text style={styles.vs}>VS</Text>
                <View style={styles.team}>
                    <Text style={styles.teamName}>{match.opponent_name}</Text>
                    <Text style={styles.flag}>🏏</Text>
                </View>
            </View>

            <View style={styles.divider} />

            {/* Footer */}
            <View style={styles.actionRow}>
                {!!match.result_summary && (
                    <>
                        <View style={styles.actionButton}>
                            <Button
                                mode='outlined'
                                icon='text-box-outline'
                                style={{ borderRadius: 8 }}
                                compact
                                onPress={() => router.push(`/matches/${match.id}/summary`)}
                            >
                                Summary
                            </Button>
                        </View>

                        <View style={styles.actionButton}>
                            <Button mode='contained' icon='content-copy' style={{ borderRadius: 8 }} compact onPress={() => onCopy(match.id)}>
                                Copy
                            </Button>
                        </View>
                    </>
                )}
                {match.match_status === "scheduled" && (
                    <>
                        <View style={styles.actionButton}>
                            <Button
                                mode='contained'
                                icon='delete'
                                style={{ borderRadius: 8, backgroundColor: Colors.danger }}
                                compact
                                onPress={() => onDelete(match.id)}
                            >
                                Delete
                            </Button>
                        </View>
                        <View style={styles.actionButton}>
                            <Button mode='contained' icon='play' style={{ borderRadius: 8 }} compact onPress={() => handleStartMatch(match.id)}>
                                Start
                            </Button>
                        </View>
                    </>
                )}
            </View>
        </View>
    );
}

export default function Matches() {
    const router = useRouter();
    const [matches, setMatches] = useState<MatchModel[]>([]);

    useFocusEffect(
        useCallback(() => {
            setMatches(MatchRepository.getAll());
        }, []),
    );

    const handleDelete = (id: number) => {
        MatchRepository.delete(id);
        setMatches(MatchRepository.getAll());
    };

    const handleCopy = (id: number) => {
        const source = MatchRepository.find(id);
        if (!source) {
            return;
        }

        const now = new Date().toISOString();
        const newMatch: MatchModel = {
            ...source,
            id: Date.now(),
            toss_winner: null,
            toss_decision: null,
            match_status: "scheduled",
            result_type: null,
            result_summary: null,
            created_at: now,
            updated_at: now,
            deleted_at: null,
            from_admin: 0,
            synced_at: null,
            dirty: 1,
        };
        MatchRepository.save(newMatch);
        const players = MatchPlayerRepository.getByMatch(id);
        const teamAIds = players.filter((p) => p.team === "team_a").map((p) => p.player_id);
        const teamBIds = players.filter((p) => p.team === "team_b").map((p) => p.player_id);
        const teamACaptain = players.find((p) => p.team === "team_a" && p.is_captain === 1)?.player_id ?? null;
        const teamBCaptain = players.find((p) => p.team === "team_b" && p.is_captain === 1)?.player_id ?? null;
        MatchPlayerRepository.saveAssignments(newMatch.id, teamAIds, teamBIds, teamACaptain, teamBCaptain);
        router.push(`/matches/${newMatch.id}/edit`);
    };

    return (
        <View style={styles.container}>
            <AppHeader />
            <Text variant='titleLarge' style={{ padding: Spacing.defaultSpace }}>
                Matches
            </Text>
            <FlatList
                data={matches}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No matches available.</Text>
                    </View>
                }
                renderItem={({ item }) => <MatchCard match={item} onDelete={handleDelete} onCopy={handleCopy} />}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },

    item: {
        paddingVertical: 16,
        paddingHorizontal: 20,
    },

    itemHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },

    actions: {
        flexDirection: "row",
        gap: 8,
    },

    matchTitle: {
        fontSize: 16,
        color: Colors.black,
    },

    matchStatus: {
        color: "#1f7a8c",
        fontSize: 12,
        fontWeight: "700",
    },

    matchMeta: {
        color: "#444",
        fontSize: 12,
    },

    separator: {
        height: 5,
    },

    listContent: {
        paddingBottom: 24,
    },

    emptyContainer: {
        marginTop: 40,
        alignItems: "center",
    },

    emptyText: {
        color: "#888",
        fontSize: 16,
    },
    actionRow: {
        flexDirection: "row",
        gap: 8,
        marginTop: 6,
    },

    actionButton: {
        flex: 1,
    },

    matchCard: {
        backgroundColor: Colors.white,
        borderRadius: 8,
        marginHorizontal: Spacing.defaultSpace,
        padding: Spacing.defaultSpace,
    },

    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    date: {
        fontWeight: "700",
        color: Colors.black,
    },

    tournament: {
        marginTop: 4,
        color: "#777",
        fontSize: 12,
    },

    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 6,
    },

    statusText: {
        color: "#FFF",
        fontSize: 11,
        fontWeight: "700",
    },

    divider: {
        height: 1,
        backgroundColor: "#ECECEC",
        marginVertical: Spacing.defaultSpace,
    },

    teamRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    team: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },

    flag: {
        fontSize: 28,
    },

    teamName: {
        fontSize: 20,
        fontWeight: "600",
        marginHorizontal: 10,
    },

    vs: {
        fontWeight: "700",
        color: Colors.primary,
    },
});
