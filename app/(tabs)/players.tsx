import AppContainer from "@/components/AppContainer";
import AppHeader from "@/components/AppHeader";
import { Colors } from "@/constants/colors";
import { Spacing } from "@/constants/spacing";
import { PlayerModel } from "@/database/models/PlayerModel";
import PlayerRepository from "@/database/repositories/PlayerRepository";
import ApiService from "@/services/ApiService";
import SyncService from "@/services/SyncService";
import { Toast } from "@/services/Toast";
import { PlayerIDs } from "@/types/player";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, FlatList, StyleSheet, View } from "react-native";
import { Avatar, Button, SegmentedButtons, Text } from "react-native-paper";

function PlayerCard({ player, router }: { player: PlayerModel; router: any }) {
    return (
        <View style={styles.card}>
            {/* Avatar */}
            <Avatar.Icon size={50} icon='account' style={styles.avatar} />

            {/* Details */}
            <View style={styles.content}>
                <View style={styles.row}>
                    <Text variant='headlineSmall' style={styles.name} numberOfLines={1}>
                        {player.name}
                    </Text>
                    {!!player.organization && (
                        <View style={{ flexDirection: "row" }}>
                            <MaterialCommunityIcons name='domain' size={14} color={Colors.darkGray} />
                            <Text style={styles.grayText}>{player.organization}</Text>
                        </View>
                    )}
                </View>

                <View style={{ flexDirection: "row" }}>
                    {player.status === "approved" && (
                        <>
                            <MaterialCommunityIcons name='shield-check' size={15} color={Colors.secondary} />
                            <Text style={styles.greenText}>Evergreen Player</Text>
                        </>
                    )}
                    {player.status === "guest" && (
                        <>
                            <MaterialIcons name='insert-invitation' size={15} color={Colors.secondary} />
                            <Text style={styles.greenText}>Guest Of {player.guest_of_player_name}</Text>
                        </>
                    )}
                    {player.status === "external" && (
                        <>
                            <FontAwesome name='external-link' size={15} color={Colors.secondary} />
                            <Text style={styles.greenText}>External matches</Text>
                        </>
                    )}
                </View>
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
        <AppContainer>
            <AppHeader />
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
            <View style={styles.actionRow}>
                <Button mode='outlined' icon='plus' onPress={() => router.push(`/players/add`)} style={styles.actionButton} labelStyle={{ color: Colors.text }}>
                    Add Player
                </Button>
                {newPlayersCount > 0 && (
                    <Button mode='outlined' icon='upload' onPress={uploadPlayers} style={styles.actionButton} labelStyle={{ color: Colors.text }}>
                        Upload List ({newPlayersCount})
                    </Button>
                )}

                {newPlayersCount <= 0 && (
                    <Button mode='outlined' icon='download' onPress={downloadPlayers} style={styles.actionButton} labelStyle={{ color: Colors.text }}>
                        Download List
                    </Button>
                )}
            </View>
        </AppContainer>
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

    card: {
        backgroundColor: Colors.white,
        padding: 8,
        flexDirection: "row",
    },

    avatar: {
        backgroundColor: "#DCE9DE",
        borderRadius: 0,
    },

    content: {
        flex: 1,
        marginHorizontal: Spacing.defaultSpace,
    },

    name: {
        fontWeight: "700",
        fontSize: 14,
    },

    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    greenText: {
        marginLeft: 4,
        fontWeight: "700",
        color: Colors.secondary,
        fontSize: 12,
    },

    grayText: {
        marginLeft: 4,
        color: Colors.textSecondary,
        fontSize: 12,
    },

    separator: {
        height: 1,
        backgroundColor: "#eee",
    },

    emptyContainer: {
        marginTop: 40,
        alignItems: "center",
    },

    emptyText: {
        color: "#888",
        fontSize: 16,
    },

    filter: {
        padding: Spacing.defaultSpace,
    },

    listContent: {
        paddingBottom: 30,
        margin: Spacing.defaultSpace,
    },

    actionRow: {
        flexDirection: "row",
        gap: 8,
        padding: 8,
        borderTopWidth: 1,
        borderColor: Colors.darkGray,
        backgroundColor: Colors.white,
    },

    actionButton: {
        flex: 1,
        borderRadius: 8,
        color: Colors.black,
    },
});
