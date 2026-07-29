import AppHeader from "@/components/AppHeader";
import { Colors } from "@/constants/colors";
import { Spacing } from "@/constants/spacing";

import MatchPlayerRepository from "@/database/repositories/MatchPlayerRepository";
import PlayerRepository from "@/database/repositories/PlayerRepository";

import ScoreEngine from "@/features/scoring/engine/ScoreEngine";
import DeliveryRepository from "@/features/scoring/repositories/DeliveryRepository";
import InningsRepository from "@/features/scoring/repositories/InningsRepository";
import { DismissalType } from "@/features/scoring/types/DismissalType";

import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Button, Card, Text } from "react-native-paper";
import { Dropdown } from "react-native-paper-dropdown";

interface PlayerItem {
    id: string;
    name: string;
}

export default function WicketScreen() {
    const router = useRouter();
    const { pendingRuns } = useLocalSearchParams<{ pendingRuns?: string }>();
    const [players, setPlayers] = useState<PlayerItem[]>([]);
    const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
    const [dismissedPlayers, setDismissedPlayers] = useState<PlayerItem[]>([]);
    const [fielderPlayers, setFielderPlayers] = useState<PlayerItem[]>([]);
    const [selectedDismissedPlayerId, setSelectedDismissedPlayerId] = useState<string>("");
    const [selectedDismissalType, setSelectedDismissalType] = useState<string>(DismissalType.BOWLED);
    const [selectedFielderId, setSelectedFielderId] = useState<string>("");

    const loadScreen = useCallback(async () => {
        const scoreboard = await ScoreEngine.getScoreboard();
        const innings = InningsRepository.find(scoreboard.inningsId);
        const lastDelivery = DeliveryRepository.findLast(scoreboard.inningsId);

        if (!innings) {
            return;
        }

        if (pendingRuns === undefined && lastDelivery) {
            const dismissedPlayerId = lastDelivery.dismissed_player_id ?? lastDelivery.batsman_id;
            const fielder = lastDelivery.fielder_id ? PlayerRepository.find(lastDelivery.fielder_id) : null;
            setSelectedDismissedPlayerId(String(dismissedPlayerId));
            setSelectedDismissalType(lastDelivery.dismissal_type ?? DismissalType.BOWLED);
            setSelectedFielderId(fielder ? String(fielder.id) : "");
        } else {
            setSelectedDismissedPlayerId(String(scoreboard.strikerId));
            setSelectedDismissalType(DismissalType.BOWLED);
            setSelectedFielderId("");
        }

        const striker = PlayerRepository.find(scoreboard.strikerId);
        const nonStriker = PlayerRepository.find(scoreboard.nonStrikerId);

        setDismissedPlayers(
            [striker ? { id: striker.id, name: striker.name } : null, nonStriker ? { id: nonStriker.id, name: nonStriker.name } : null].filter(
                Boolean,
            ) as PlayerItem[],
        );

        const bowlingTeamPlayers = MatchPlayerRepository.getTeamPlayers(innings.match_id, innings.bowling_team);

        const fielderList: PlayerItem[] = [];

        for (const playerId of bowlingTeamPlayers) {
            const player = PlayerRepository.find(playerId);

            if (!player) {
                continue;
            }

            fielderList.push({
                id: player.id,
                name: player.name,
            });
        }

        setFielderPlayers(fielderList);

        const matchPlayers = MatchPlayerRepository.getRemainingBatsmen(innings.match_id, innings.batting_team, scoreboard.inningsId, [
            scoreboard.strikerId,
            scoreboard.nonStrikerId,
        ]);

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
    }, [pendingRuns]);

    useEffect(() => {
        void loadScreen();
    }, [loadScreen]);

    function requiresFielder(dismissalType?: string | null) {
        return dismissalType === DismissalType.CAUGHT || dismissalType === DismissalType.RUN_OUT || dismissalType === DismissalType.STUMPED;
    }

    function onDismissedPlayerChange(value: string) {
        setSelectedDismissedPlayerId(value);
    }

    function onDismissalTypeChange(value: string) {
        setSelectedDismissalType(value);

        if (!requiresFielder(value)) {
            setSelectedFielderId("");
            return;
        }
    }

    function onFielderChange(value: string) {
        setSelectedFielderId(value);
    }

    const isAllOut = players.length === 0;

    async function onContinue() {
        if ((!isAllOut && !selectedPlayerId) || !selectedDismissedPlayerId || !selectedDismissalType) {
            return;
        }

        if (pendingRuns !== undefined) {
            await ScoreEngine.recordWicket(
                Number(pendingRuns),
                selectedDismissedPlayerId,
                selectedDismissalType as DismissalType,
                selectedPlayerId || undefined,
                selectedFielderId || undefined,
            );
        } else {
            await ScoreEngine.resolveWicket(
                selectedPlayerId || undefined,
                selectedDismissedPlayerId,
                selectedDismissalType as DismissalType,
                selectedFielderId || undefined,
            );
        }

        if (!isAllOut && ScoreEngine.isEndOfOver()) {
            router.replace("/scoring/bowler");
            return;
        }

        router.back();
    }

    return (
        <>
            <AppHeader showBack />

            <ScrollView contentContainerStyle={styles.container}>
                <Card>
                    <Card.Content>
                        <Text variant='titleMedium' style={styles.sectionTitle}>
                            Dismissed Batsman
                        </Text>
                        <Dropdown
                            mode='outlined'
                            value={selectedDismissedPlayerId}
                            options={dismissedPlayers.map((player) => ({
                                label: player.name,
                                value: String(player.id),
                            }))}
                            onSelect={(value) => {
                                onDismissedPlayerChange(value ?? "");
                            }}
                        />
                    </Card.Content>
                </Card>

                <Card>
                    <Card.Content>
                        <Text variant='titleMedium' style={styles.sectionTitle}>
                            How Got Out
                        </Text>

                        <Dropdown
                            mode='outlined'
                            value={selectedDismissalType}
                            options={[
                                { label: "Bowled", value: DismissalType.BOWLED },
                                { label: "Caught", value: DismissalType.CAUGHT },
                                { label: "Run Out", value: DismissalType.RUN_OUT },
                                { label: "Stumped", value: DismissalType.STUMPED },
                                { label: "Retired Hurt", value: DismissalType.RETIRED_HURT },
                                { label: "Hit Wicket", value: DismissalType.HIT_WICKET },
                                { label: "LBW", value: DismissalType.LBW },
                            ]}
                            onSelect={(value) => {
                                onDismissalTypeChange(value ?? "");
                            }}
                        />

                        {requiresFielder(selectedDismissalType) ? (
                            <Dropdown
                                label='Fielder'
                                mode='outlined'
                                value={selectedFielderId}
                                options={fielderPlayers.map((player) => ({
                                    label: player.name,
                                    value: String(player.id),
                                }))}
                                onSelect={(value) => {
                                    onFielderChange(value ?? "");
                                }}
                            />
                        ) : null}
                    </Card.Content>
                </Card>

                <Card>
                    <Card.Content>
                        <Text variant='titleMedium' style={styles.sectionTitle}>
                            Incoming Batsman
                        </Text>

                        {isAllOut ? (
                            <Text style={styles.metaText}>Team all out — no batsman remaining.</Text>
                        ) : (
                            <Dropdown
                                label='Select Batsman'
                                mode='outlined'
                                value={selectedPlayerId}
                                options={players.map((player) => ({
                                    label: player.name,
                                    value: String(player.id),
                                }))}
                                onSelect={(value) => setSelectedPlayerId(value ?? "")}
                            />
                        )}
                    </Card.Content>
                </Card>

                <Button
                    mode='contained'
                    onPress={onContinue}
                    disabled={(!isAllOut && !selectedPlayerId) || !selectedDismissedPlayerId || !selectedDismissalType}
                    style={styles.button}
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
