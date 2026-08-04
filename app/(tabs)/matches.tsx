import AppContainer from "@/components/AppContainer";
import AppHeader from "@/components/AppHeader";
import MatchCard from "@/components/MatchCard";
import { Colors } from "@/constants/colors";
import { Spacing } from "@/constants/spacing";
import { MatchModel } from "@/database/models/MatchModel";
import MatchRepository from "@/database/repositories/MatchRepository";
import SyncService from "@/services/SyncService";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, FlatList, StyleSheet, View } from "react-native";
import { Button, FAB, Text } from "react-native-paper";

export default function Matches() {
    const router = useRouter();
    const [matches, setMatches] = useState<MatchModel[]>([]);

    useFocusEffect(
        useCallback(() => {
            setMatches(MatchRepository.getAll());
        }, []),
    );

    const handleDelete = (id: number) => {
        Alert.alert("Delete match", "Are you sure you want to delete this match and its player assignments?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: () => {
                    MatchRepository.delete(id);
                    setMatches(MatchRepository.getAll());
                },
            },
        ]);
    };

    const handleDownload = () => {
        SyncService.syncScheduledMatches();
        setMatches(MatchRepository.getAll());
    };

    return (
        <AppContainer>
            <AppHeader />
            <View style={{ padding: Spacing.defaultSpace }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <Text variant='titleLarge' style={{ flex: 1 }}>
                        Matches
                    </Text>
                    <Button icon='download' mode='outlined' onPress={handleDownload} style={{ borderRadius: 8 }}>
                        Download
                    </Button>
                </View>
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
            <FAB icon='plus' label='New Match' size='small' onPress={() => router.push("/matches/add")} style={styles.fab} />
        </AppContainer>
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
        paddingVertical: Spacing.defaultSpace,
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

    fab: {
        position: "absolute",
        right: 20,
        bottom: 20,
    },
});
