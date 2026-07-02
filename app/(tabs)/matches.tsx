import AppHeader from "@/components/AppHeader";
import { MatchModel } from "@/database/models/MatchModel";
import MatchRepository from "@/database/repositories/MatchRepository";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

function formatDate(dateString: string | null) {
    if (!dateString) return "-";

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function MatchCard({ match }: { match: MatchModel }) {
    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.matchDate}>{formatDate(match.scheduled_at)}</Text>
                <Text style={styles.matchStatus}>{match.match_status}</Text>
            </View>

            <Text style={styles.matchTitle}>{`${match.team_name} vs ${match.opponent_name}`}</Text>

            <Text style={styles.matchResult} numberOfLines={2} ellipsizeMode='tail'>
                {match.result_summary || "No result available"}
            </Text>
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

    return (
        <View style={styles.container}>
            <AppHeader title='Matches' rightIcon='plus' onRightPress={addMatch} />

            <FlatList
                data={matches}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No matches available.</Text>
                    </View>
                }
                renderItem={({ item }) => <MatchCard match={item} />}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },

    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
        borderWidth: 1,
        borderColor: "#eee",
    },

    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },

    matchDate: {
        color: "#666",
        fontSize: 12,
    },

    matchStatus: {
        color: "#1f7a8c",
        fontSize: 12,
        fontWeight: "700",
    },

    matchTitle: {
        color: "#111",
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 6,
    },

    matchResult: {
        color: "#444",
        fontSize: 14,
        lineHeight: 20,
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
});
