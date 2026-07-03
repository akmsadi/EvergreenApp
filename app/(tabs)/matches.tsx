import AppHeader from "@/components/AppHeader";
import { MatchModel } from "@/database/models/MatchModel";
import MatchRepository from "@/database/repositories/MatchRepository";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";

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
        <View style={styles.item}>
            <Text style={styles.matchTitle}>{`${match.team_name} vs ${match.opponent_name}`}</Text>
            <View style={[styles.itemHeader, , { marginTop: 5 }]}>
                <Text style={styles.matchMeta}>{formatDate(match.scheduled_at)}</Text>
                <Text style={styles.matchStatus}>{match.match_status}</Text>
            </View>
            <View style={styles.itemHeader}>
                <Text style={styles.matchMeta}>{match.result_summary || "No result available"}</Text>
                <Button mode='contained' onPress={() => MatchRepository.delete(match.id)}>
                    Delete
                </Button>
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

    item: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: "#fff",
    },

    itemHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },

    matchTitle: {
        color: "#111",
        fontSize: 16,
        fontWeight: "700",
    },

    matchStatus: {
        color: "#1f7a8c",
        fontSize: 12,
        fontWeight: "700",
    },

    matchMeta: {
        color: "#444",
        fontSize: 14,
        lineHeight: 20,
    },

    separator: {
        height: 1,
        backgroundColor: "#eee",
        marginLeft: 20,
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
