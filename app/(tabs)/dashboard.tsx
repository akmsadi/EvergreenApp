import AppContainer from "@/components/AppContainer";
import AppHeader from "@/components/AppHeader";
import MatchCard from "@/components/MatchCard";
import { Colors } from "@/constants/colors";
import { Spacing } from "@/constants/spacing";
import { MatchModel } from "@/database/models/MatchModel";
import MatchRepository from "@/database/repositories/MatchRepository";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, FlatList, StyleSheet, View } from "react-native";
import { FAB, Text } from "react-native-paper";

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

    const handleDelete = (matchId: number) => {
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

    return (
        <AppContainer>
            <AppHeader />
            <View style={{ padding: Spacing.defaultSpace }}>
                <Text variant='titleLarge' style={{ marginBottom: Spacing.defaultSpace }}>
                    Matches
                </Text>
                {scheduledMatches.length > 0 ? (
                    <>
                        <FlatList
                            data={scheduledMatches}
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
                    </>
                ) : (
                    <Text style={styles.noMatches}>No scheduled matches found.</Text>
                )}
            </View>

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

    teamName: {
        textAlign: "center",
        fontSize: 16,
        paddingHorizontal: 8,
    },

    vsCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 8,
    },

    vsText: {
        fontSize: 16,
    },

    divider: {
        height: 1,
        backgroundColor: Colors.darkGray,
    },

    actionRow: {
        flexDirection: "row",
        alignItems: "stretch",
        borderTopWidth: 1,
        borderColor: Colors.gray,
    },

    actionItem: {
        flex: 1,
    },

    verticalDivider: {
        width: 1,
        backgroundColor: Colors.gray,
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
        paddingHorizontal: Spacing.defaultSpace,
        marginBottom: Spacing.defaultSpace,
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

    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: Spacing.defaultSpace,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray,
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
    listContent: {
        paddingBottom: 24,
    },
    separator: {
        height: 5,
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
