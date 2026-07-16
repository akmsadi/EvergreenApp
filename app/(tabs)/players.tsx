import AppHeader from "@/components/AppHeader";
import { Colors } from "@/constants/colors";
import { Spacing } from "@/constants/spacing";
import { PlayerModel } from "@/database/models/PlayerModel";
import PlayerRepository from "@/database/repositories/PlayerRepository";
import ApiService from "@/services/ApiService";
import SyncService from "@/services/SyncService";
import { Toast } from "@/services/Toast";
import { PlayerIDs } from "@/types/player";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import { Button, IconButton, SegmentedButtons } from "react-native-paper";

function PlayerCard({ player, router }: { player: PlayerModel; router: any }) {
    return (
        <View style={styles.item}>
            <View style={styles.itemHeader}>
                <View style={styles.nameRow}>
                    <View style={styles.playerNameRow}>
                        <Text style={styles.playerName}>{player.name}</Text>
                        {player.organization && <Text style={styles.playerMeta}>• {player.organization}</Text>}
                    </View>
                    {player.server_id === null && (
                        <IconButton icon='pencil-outline' size={18} onPress={() => router.push(`/players/${player.id}/edit`)} style={{ margin: 0 }} />
                    )}
                </View>
                <Text style={styles.playerStatus}>{player.status}</Text>
            </View>
        </View>
    );
}

export default function Players() {
    const router = useRouter();
    const [players, setPlayers] = useState<PlayerModel[]>([]);
    const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "guest" | "external">("approved");
    const [newPlayersCount, setNewPlayersCount] = useState<number>(0);

    useFocusEffect(
        useCallback(() => {
            syncPlayers();
        }, []),
    );

    const syncPlayers = async () => {
        const db_players = PlayerRepository.getAll();
        const unsyncedCount = db_players.filter((player) => player.server_id === null).length;
        setPlayers(db_players);
        setNewPlayersCount(unsyncedCount);
    };

    const filteredPlayers = players.filter((player) => {
        if (statusFilter === "all") {
            return true;
        }
        return player.status.toLowerCase() === statusFilter;
    });

    const downloadPlayers = async () => {
        try {
            const count = await SyncService.syncPlayers();
            syncPlayers();
            Toast.success(`${count} players synchronized successfully.`);
        } catch (error) {
            Toast.error(`Download Failed: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    };

    const uploadPlayers = async () => {
        const players = PlayerRepository.getAppPlayers();

        if (players.length === 0) {
            Alert.alert("No new players to upload");
            return;
        }

        try {
            const playerIds = await ApiService.post<PlayerIDs[]>("/players", players);
            PlayerRepository.updateServerIds(playerIds);
            Alert.alert("Success", `${playerIds.length} players uploaded.`);
            syncPlayers();
        } catch (error) {
            Alert.alert("Upload Failed", error instanceof Error ? error.message : "Unknown error");
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <AppHeader
                title='Players'
                rightIcon='plus'
                onRightPress={() => {
                    router.push("/players/add");
                }}
            />
            <SegmentedButtons
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as "all" | "approved" | "guest" | "external")}
                buttons={[
                    {
                        value: "all",
                        label: "All",
                        style: { borderRadius: 8 },
                    },
                    {
                        value: "approved",
                        label: "Member",
                    },
                    {
                        value: "guest",
                        label: "Guest",
                    },
                    {
                        value: "external",
                        label: "External",
                        style: { borderRadius: 8 },
                    },
                ]}
                style={styles.filter}
            />
            <FlatList
                data={filteredPlayers}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No players available.</Text>
                    </View>
                }
                renderItem={({ item }) => <PlayerCard player={item} router={router} />}
            />
            <View style={styles.bottomButtons}>
                <View style={styles.buttonRow}>
                    {newPlayersCount > 0 && (
                        <View style={styles.buttonWrapper}>
                            <Button mode='text' icon='upload' onPress={uploadPlayers}>
                                Upload List ({newPlayersCount})
                            </Button>
                        </View>
                    )}

                    {newPlayersCount <= 0 && (
                        <View style={styles.buttonWrapper}>
                            <Button mode='text' icon='download' onPress={downloadPlayers}>
                                Download List
                            </Button>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
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

    playerNameRow: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 6,
    },

    playerName: {
        color: "#111",
        fontSize: 14,
    },

    playerMeta: {
        color: Colors.darkGray,
        fontSize: 14,
    },

    playerStatus: {
        color: Colors.white,
        fontSize: 12,
        backgroundColor: "#1f7a8c",
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderRadius: 4,
        textTransform: "capitalize",
    },

    separator: {
        height: 1,
        backgroundColor: "#eee",
        marginLeft: 20,
    },

    emptyContainer: {
        marginTop: 40,
        alignItems: "center",
    },

    emptyText: {
        color: "#888",
        fontSize: 16,
    },

    button: {
        marginBottom: 10,
    },

    filter: {
        padding: Spacing.defaultSpace,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.darkGray,
    },

    listContent: {
        paddingBottom: 100,
    },

    bottomButtons: {
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: Colors.darkGray,
        padding: Spacing.space10,
    },

    buttonRow: {
        flexDirection: "row",
        gap: 10,
    },

    buttonWrapper: {
        flex: 1,
    },

    nameRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
});
