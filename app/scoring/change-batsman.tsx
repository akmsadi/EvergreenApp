import AppHeader from "@/components/AppHeader";
import { Colors } from "@/constants/colors";
import { Spacing } from "@/constants/spacing";
import MatchPlayerRepository from "@/database/repositories/MatchPlayerRepository";
import PlayerRepository from "@/database/repositories/PlayerRepository";
import ScoreEngine from "@/features/scoring/engine/ScoreEngine";
import InningsRepository from "@/features/scoring/repositories/InningsRepository";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
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

        setOutgoingOptions(
            [
                scoreboard.strikerId ? { id: scoreboard.strikerId, name: scoreboard.strikerName } : null,
                scoreboard.nonStrikerId ? { id: scoreboard.nonStrikerId, name: scoreboard.nonStrikerName } : null,
            ]
                .filter(Boolean)
                .map((player) => ({ label: player!.name, value: String(player!.id) })),
        );

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
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    async function onContinue() {
        if (!selectedOutgoingId || !selectedIncomingId) {
            return;
        }

        await ScoreEngine.changeBatsman(selectedOutgoingId, selectedIncomingId);
        router.back();
    }

    return (
        <>
            <AppHeader showBack />

            <ScrollView contentContainerStyle={styles.container}>
                <Card style={{ backgroundColor: Colors.white }}>
                    <Card.Content>
                        <Text variant='titleMedium' style={styles.sectionTitle}>
                            Batsman Retiring Hurt
                        </Text>
                        <Dropdown
                            label='Select Batsman'
                            mode='outlined'
                            value={selectedOutgoingId}
                            options={outgoingOptions}
                            onSelect={(value) => setSelectedOutgoingId(value ?? "")}
                        />
                    </Card.Content>
                </Card>

                <Card style={{ backgroundColor: Colors.white }}>
                    <Card.Content>
                        <Text variant='titleMedium' style={styles.sectionTitle}>
                            Incoming Batsman
                        </Text>

                        {incomingOptions.length === 0 ? (
                            <Text style={styles.metaText}>No batsmen remaining.</Text>
                        ) : (
                            <Dropdown
                                label='Select Batsman'
                                mode='outlined'
                                value={selectedIncomingId}
                                options={incomingOptions}
                                onSelect={(value) => setSelectedIncomingId(value ?? "")}
                            />
                        )}
                    </Card.Content>
                </Card>

                <Button
                    mode='contained'
                    style={styles.button}
                    onPress={onContinue}
                    disabled={!selectedOutgoingId || !selectedIncomingId}
                >
                    Continue
                </Button>
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: Spacing.defaultSpace,
        gap: Spacing.defaultSpace,
        backgroundColor: Colors.background,
    },

    sectionTitle: {
        marginBottom: 8,
    },

    metaText: {
        marginTop: 4,
        opacity: 0.7,
    },

    button: {
        marginTop: 8,
        borderRadius: 8,
    },
});
