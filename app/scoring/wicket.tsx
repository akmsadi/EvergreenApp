import AppHeader from "@/components/AppHeader";

import MatchPlayerRepository from "@/database/repositories/MatchPlayerRepository";
import PlayerRepository from "@/database/repositories/PlayerRepository";

import ScoreEngine from "@/features/scoring/engine/ScoreEngine";

import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Button, Card, RadioButton } from "react-native-paper";

interface PlayerItem {
    id: number;
    name: string;
}

export default function WicketScreen() {
    const router = useRouter();

    const { matchId, inningsId, battingTeam } = useLocalSearchParams<{
        matchId: string;
        inningsId: string;
        battingTeam: "team_a" | "team_b";
    }>();

    const [players, setPlayers] = useState<PlayerItem[]>([]);

    const [selectedPlayerId, setSelectedPlayerId] = useState<number>();

    useEffect(() => {
        loadPlayers();
    }, []);

    function loadPlayers() {
        const matchPlayers = MatchPlayerRepository.getRemainingBatsmen(
            Number(matchId),

            battingTeam,

            Number(inningsId),
        );

        const list: PlayerItem[] = [];

        for (const mp of matchPlayers) {
            const player = PlayerRepository.find(mp.player_id);

            if (!player) {
                continue;
            }

            list.push({
                id: player.id,

                name: player.name,
            });
        }

        setPlayers(list);
    }

    async function onContinue() {
        if (!selectedPlayerId) {
            return;
        }

        await ScoreEngine.selectNextBatsman(selectedPlayerId);

        router.back();
    }

    return (
        <>
            <AppHeader title='New Batsman' showBack />

            <ScrollView contentContainerStyle={styles.container}>
                <Card>
                    <Card.Title title='Select Incoming Batsman' />

                    <Card.Content>
                        <RadioButton.Group
                            value={selectedPlayerId ? String(selectedPlayerId) : ""}
                            onValueChange={(value) => setSelectedPlayerId(Number(value))}
                        >
                            {players.map((player) => (
                                <RadioButton.Item key={player.id} label={player.name} value={String(player.id)} />
                            ))}
                        </RadioButton.Group>
                    </Card.Content>
                </Card>

                <Button mode='contained' onPress={onContinue} disabled={!selectedPlayerId} style={styles.button}>
                    Continue
                </Button>
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        gap: 16,
    },

    button: {
        marginTop: 8,
    },
});
