import { Colors } from "@/constants/colors";
import { Spacing } from "@/constants/spacing";
import MatchPlayerRepository from "@/database/repositories/MatchPlayerRepository";
import PlayerRepository from "@/database/repositories/PlayerRepository";
import ScoreEngine from "@/features/scoring/engine/ScoreEngine";
import InningsRepository from "@/features/scoring/repositories/InningsRepository";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ImageBackground, ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";
import { Dropdown } from "react-native-paper-dropdown";

interface BowlerOption {
    label: string;
    value: string;
}

export default function Bowler() {
    const router = useRouter();

    const [options, setOptions] = useState<BowlerOption[]>([]);
    const [selectedBowlerId, setSelectedBowlerId] = useState<string>("");
    const [isEndOfOverChange, setIsEndOfOverChange] = useState(false);

    useEffect(() => {
        load();
    }, []);

    async function load() {
        const scoreboard = await ScoreEngine.getScoreboard();
        const innings = InningsRepository.find(scoreboard.inningsId);
        const isEndOfOver = ScoreEngine.isEndOfOver();

        setIsEndOfOverChange(isEndOfOver);

        if (!innings) {
            return;
        }

        const playerIds = MatchPlayerRepository.getTeamPlayers(innings.match_id, innings.bowling_team);

        const bowlerOptions = playerIds
            .filter((playerId) => playerId !== scoreboard.bowlerId)
            .map((playerId) => {
                const player = PlayerRepository.find(playerId);

                return player
                    ? {
                          label: player.name,
                          value: String(player.id),
                      }
                    : null;
            })
            .filter(Boolean) as BowlerOption[];

        setOptions(bowlerOptions);

        if (bowlerOptions.length > 0) {
            setSelectedBowlerId((current) => current || bowlerOptions[0].value);
        }
    }

    async function onContinue() {
        if (!selectedBowlerId) {
            return;
        }

        await ScoreEngine.changeBowler(selectedBowlerId);
        router.back();
    }

    return (
        <ImageBackground source={require("@/assets/images/background-stadium.webp")} style={styles.background} resizeMode='cover'>
            <ScrollView contentContainerStyle={styles.container}>
                <Card style={styles.card}>
                    <Card.Content style={styles.cardContent}>
                        <Text variant='titleMedium' style={styles.title}>
                            {isEndOfOverChange ? "Select next over bowler" : "Change bowler and continue this over"}
                        </Text>
                        <Dropdown mode='outlined' value={selectedBowlerId} options={options} onSelect={(value) => setSelectedBowlerId(value ?? "")} />

                        <View style={styles.actionsRow}>
                            <Button mode='outlined' style={styles.cancelButton} onPress={() => router.back()}>
                                Cancel
                            </Button>

                            <Button mode='contained' style={styles.button} onPress={onContinue} disabled={!selectedBowlerId}>
                                Continue
                            </Button>
                        </View>
                    </Card.Content>
                </Card>
            </ScrollView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: "100%",
    },

    container: {
        flexGrow: 1,
        justifyContent: "center",
        padding: Spacing.defaultSpace,
        gap: Spacing.defaultSpace,
    },

    card: {
        backgroundColor: "rgba(0,0,0,0.65)",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.3)",
    },

    cardContent: {
        gap: 8,
    },

    title: {
        marginBottom: 4,
        color: Colors.white,
    },

    actionsRow: {
        flexDirection: "row",
        gap: 12,
        marginTop: Spacing.defaultSpace,
    },

    cancelButton: {
        flex: 1,
        borderRadius: 8,
        borderColor: "rgba(255,255,255,0.5)",
    },

    button: {
        flex: 1,
        borderRadius: 8,
    },
});
