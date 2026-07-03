import AppHeader from "@/components/AppHeader";
import { PlayerModel } from "@/database/models/PlayerModel";
import PlayerRepository from "@/database/repositories/PlayerRepository";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

function PlayerCard({ player }: { player: PlayerModel }) {
    return (
        <View style={styles.item}>
            <View style={styles.itemHeader}>
                <Text style={styles.playerName}>{player.name}</Text>
                <Text style={styles.playerStatus}>{player.status}</Text>
            </View>
            <Text style={styles.playerMeta}>{player.organization || "No organization"}</Text>
        </View>
    );
}

export default function Players() {
    const [players, setPlayers] = useState<PlayerModel[]>([]);

    useEffect(() => {
        setPlayers(PlayerRepository.getAll());
    }, []);

    const addPlayer = () => {
        // Logic to add a new player
    };

    return (
        <View style={styles.container}>
            <AppHeader title='Players' rightIcon='plus' onRightPress={addPlayer} />

            <FlatList
                data={players}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No players available.</Text>
                    </View>
                }
                renderItem={({ item }) => <PlayerCard player={item} />}
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

    playerName: {
        color: "#111",
        fontSize: 16,
        fontWeight: "700",
    },

    playerStatus: {
        color: "#1f7a8c",
        fontSize: 12,
        fontWeight: "700",
        borderWidth: 1,
        borderColor: "#1f7a8c",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },

    playerMeta: {
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
