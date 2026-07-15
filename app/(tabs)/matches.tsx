import AppHeader from "@/components/AppHeader";
import { Colors } from "@/constants/colors";
import { MatchModel } from "@/database/models/MatchModel";
import MatchPlayerRepository from "@/database/repositories/MatchPlayerRepository";
import MatchRepository from "@/database/repositories/MatchRepository";
import ScoreEngine from "@/features/scoring/engine/ScoreEngine";
import { formatDate } from "@/utils/Common";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";

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
        <View style={styles.item}>
            <View style={[styles.itemHeader]}>
                <Text style={styles.matchTitle}>{`${match.team_name} vs ${match.opponent_name}`}</Text>
                <Text style={styles.matchMeta}>{formatDate(match.scheduled_at)}</Text>
            </View>
            <View style={styles.itemHeader}>
                <Text style={styles.matchMeta}>{match.result_summary || "No result available"}</Text>
            </View>

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
                            <Button mode='outlined' icon='play' style={{ borderRadius: 8 }} compact onPress={() => handleStartMatch(match.id)}>
                                Start
                            </Button>
                        </View>
                        <View style={styles.actionButton}>
                            <Button mode='contained' icon='delete' style={{ borderRadius: 8 }} compact onPress={() => onDelete(match.id)}>
                                Delete
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

    const addMatch = () => {
        router.push("/matches/add");
    };

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
            <AppHeader title='Matches' rightIcon='plus' onRightPress={addMatch} />

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
        height: 1,
        backgroundColor: Colors.darkGray,
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
});
