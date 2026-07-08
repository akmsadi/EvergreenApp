import AppHeader from "@/components/AppHeader";
import { Colors } from "@/constants/colors";
import { MatchModel } from "@/database/models/MatchModel";
import MatchRepository from "@/database/repositories/MatchRepository";
import { formatDate } from "@/utils/Common";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";

function MatchCard({ match, onDelete }: { match: MatchModel; onDelete: (id: number) => void }) {
    return (
        <View style={styles.item}>
            <View style={[styles.itemHeader]}>
                <Text style={styles.matchTitle}>{`${match.team_name} vs ${match.opponent_name}`}</Text>
                <Text style={styles.matchMeta}>{formatDate(match.scheduled_at)}</Text>
            </View>
            <View style={styles.itemHeader}>
                <Text style={styles.matchMeta}>{match.result_summary || "No result available"}</Text>
                {match.match_status === "scheduled" && (
                    <Button mode='contained' onPress={() => onDelete(match.id)}>
                        Delete
                    </Button>
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
                renderItem={({ item }) => <MatchCard match={item} onDelete={handleDelete} />}
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

    matchTitle: {
        fontSize: 14,
        color: Colors.black,
    },

    matchStatus: {
        color: "#1f7a8c",
        fontSize: 12,
        fontWeight: "700",
    },

    matchMeta: {
        color: "#444",
        fontSize: 14,
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
