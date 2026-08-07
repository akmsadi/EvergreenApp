import { Colors } from "@/constants/colors";
import { Spacing } from "@/constants/spacing";
import MatchPlayerRepository from "@/database/repositories/MatchPlayerRepository";
import PlayerRepository from "@/database/repositories/PlayerRepository";
import ScoreEngine from "@/features/scoring/engine/ScoreEngine";
import InningsRepository from "@/features/scoring/repositories/InningsRepository";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ImageBackground, ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";
import { Dropdown } from "react-native-paper-dropdown";

interface PlayerOption {
    label: string;
    value: string;
}

export default function ChangeBatsmanScreen() {
    const router = useRouter();

    const [outgoingOptions, setOutgoingOptions] = useState<PlayerOption[]>([]);
    const [incomingOptions, setIncomingOptions] = useState<PlayerOption[]>([]);
    const [selectedOutgoingId, setSelectedOutgoingId] = useState<string>("");
    const [selectedIncomingId, setSelectedIncomingId] = useState<string>("");

    const load = useCallback(async () => {
        const scoreboard = await ScoreEngine.getScoreboard();
        const innings = InningsRepository.find(scoreboard.inningsId);

        if (!innings) {
            return;
        }

        const outgoing = [
            scoreboard.strikerId ? { id: scoreboard.strikerId, name: scoreboard.strikerName } : null,
            scoreboard.nonStrikerId ? { id: scoreboard.nonStrikerId, name: scoreboard.nonStrikerName } : null,
        ]
            .filter(Boolean)
            .map((player) => ({ label: player!.name, value: String(player!.id) }));

        setOutgoingOptions(outgoing);

        if (outgoing.length > 0) {
            setSelectedOutgoingId((current) => current || outgoing[0].value);
        }

        const remainingBatsmen = MatchPlayerRepository.getRemainingBatsmen(innings.match_id, innings.batting_team, scoreboard.inningsId, [
            scoreboard.strikerId,
            scoreboard.nonStrikerId,
        ]);

        const options = remainingBatsmen
            .map((matchPlayer) => {
                const player = PlayerRepository.find(matchPlayer.player_id);

                return player
                    ? {
                          label: player.name,
                          value: String(player.id),
                      }
                    : null;
            })
            .filter(Boolean) as PlayerOption[];

        setIncomingOptions(options);

        if (options.length > 0) {
            setSelectedIncomingId((current) => current || options[0].value);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    async function onContinue() {
        await ScoreEngine.changeBatsman(selectedOutgoingId, selectedIncomingId);
        router.back();
    }

    return (
        <ImageBackground source={require("@/assets/images/background-stadium.webp")} style={styles.background} resizeMode='cover'>
            {/* <AppHeader /> */}
            <ScrollView contentContainerStyle={styles.container}>
                <Card style={styles.card}>
                    <Card.Content style={styles.cardContent}>
                        <Text variant='titleMedium' style={styles.sectionTitle}>
                            Batsman Retiring Hurt
                        </Text>
                        <Dropdown
                            mode='outlined'
                            value={selectedOutgoingId}
                            options={outgoingOptions}
                            onSelect={(value) => setSelectedOutgoingId(value ?? "")}
                        />

                        <Text variant='titleMedium' style={[styles.sectionTitle, { marginTop: Spacing.defaultSpace }]}>
                            Incoming Batsman
                        </Text>

                        {incomingOptions.length === 0 ? (
                            <Text style={styles.metaText}>No batsmen remaining.</Text>
                        ) : (
                            <Dropdown
                                mode='outlined'
                                value={selectedIncomingId}
                                options={incomingOptions}
                                onSelect={(value) => setSelectedIncomingId(value ?? "")}
                            />
                        )}

                        <View style={styles.actionsRow}>
                            <Button mode='outlined' style={styles.cancelButton} onPress={() => router.back()}>
                                Back
                            </Button>

                            <Button mode='contained' style={styles.button} onPress={onContinue}>
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

    sectionTitle: {
        marginBottom: 4,
        color: Colors.white,
    },

    metaText: {
        marginTop: 4,
        opacity: 0.7,
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
