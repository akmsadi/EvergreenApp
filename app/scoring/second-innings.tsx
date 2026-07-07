import AppHeader from "@/components/AppHeader";
import AppSelect from "@/components/AppSelect";
import { Colors } from "@/constants/colors";
import { Spacing } from "@/constants/spacing";

import MatchPlayerRepository from "@/database/repositories/MatchPlayerRepository";
import MatchRepository from "@/database/repositories/MatchRepository";
import PlayerRepository from "@/database/repositories/PlayerRepository";

import ScoreEngine from "@/features/scoring/engine/ScoreEngine";
import InningsRepository from "@/features/scoring/repositories/InningsRepository";

import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";

export default function SecondInningsScreen() {
    const router = useRouter();

    const { matchId } = useLocalSearchParams();

    const matchIdNum = Number(matchId);

    const [match, setMatch] = useState<any>();

    const [battingTeam, setBattingTeam] = useState<"team_a" | "team_b">("team_a");
    const [target, setTarget] = useState<number>(0);

    const [battingPlayers, setBattingPlayers] = useState<any[]>([]);
    const [bowlingPlayers, setBowlingPlayers] = useState<any[]>([]);

    const [strikerId, setStrikerId] = useState<number>();
    const [nonStrikerId, setNonStrikerId] = useState<number>();
    const [bowlerId, setBowlerId] = useState<number>();

    useEffect(() => {
        load();
    }, []);

    function load() {
        setMatch(MatchRepository.find(matchIdNum));

        const firstInnings = InningsRepository.findByMatchAndNo(matchIdNum, 1);

        if (!firstInnings) {
            return;
        }

        setBattingTeam(firstInnings.bowling_team);
        setTarget(firstInnings.total_runs + 1);

        const battingIds = MatchPlayerRepository.getTeamPlayers(matchIdNum, firstInnings.bowling_team);
        const bowlingIds = MatchPlayerRepository.getTeamPlayers(matchIdNum, firstInnings.batting_team);

        setBattingPlayers(battingIds.map((id) => PlayerRepository.find(id)).filter(Boolean));
        setBowlingPlayers(bowlingIds.map((id) => PlayerRepository.find(id)).filter(Boolean));
    }

    const battingTeamName = battingTeam === "team_a" ? match?.team_name : match?.opponent_name;

    const strikerOptions = useMemo(
        () =>
            battingPlayers.map((player) => ({
                label: player.name,
                value: String(player.id),
            })),
        [battingPlayers],
    );

    const nonStrikerOptions = useMemo(
        () =>
            battingPlayers
                .filter((player) => player.id !== strikerId)
                .map((player) => ({
                    label: player.name,
                    value: String(player.id),
                })),
        [battingPlayers, strikerId],
    );

    const bowlerOptions = useMemo(
        () =>
            bowlingPlayers.map((player) => ({
                label: player.name,
                value: String(player.id),
            })),
        [bowlingPlayers],
    );

    async function start() {
        if (!strikerId || !nonStrikerId || !bowlerId) {
            alert("Select opening players.");

            return;
        }

        await ScoreEngine.startSecondInnings({
            strikerId,
            nonStrikerId,
            bowlerId,
        });

        router.replace("/scoring");
    }

    return (
        <View style={styles.container}>
            <AppHeader title='Start 2nd Innings' subtitle={`Target: ${target}`} />

            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                <Card style={{ backgroundColor: Colors.white, marginBottom: 8 }}>
                    <Card.Content>
                        <Text variant='titleMedium' style={styles.cardTitle}>
                            {battingTeamName ?? "Batting team"} need {target} to win
                        </Text>
                    </Card.Content>
                </Card>

                <Card style={{ backgroundColor: Colors.white, marginBottom: 8 }}>
                    <Card.Content>
                        <Text variant='titleMedium' style={styles.cardTitle}>
                            Opening Batsman
                        </Text>

                        <AppSelect
                            label='Striker'
                            value={strikerOptions.find((option) => option.value === String(strikerId))?.label ?? ""}
                            options={strikerOptions}
                            onChange={(value) => {
                                const selectedStrikerId = Number(value);
                                setStrikerId(selectedStrikerId);

                                if (selectedStrikerId === nonStrikerId) {
                                    setNonStrikerId(undefined);
                                }
                            }}
                        />

                        <AppSelect
                            label='Non-striker'
                            value={nonStrikerOptions.find((option) => option.value === String(nonStrikerId))?.label ?? ""}
                            options={nonStrikerOptions}
                            onChange={(value) => setNonStrikerId(Number(value))}
                        />
                    </Card.Content>
                </Card>

                <Card style={{ backgroundColor: Colors.white, marginBottom: 8 }}>
                    <Card.Content>
                        <Text variant='titleMedium' style={styles.cardTitle}>
                            Opening Bowler
                        </Text>

                        <AppSelect
                            label='Bowler'
                            value={bowlerOptions.find((option) => option.value === String(bowlerId))?.label ?? ""}
                            options={bowlerOptions}
                            onChange={(value) => setBowlerId(Number(value))}
                        />
                    </Card.Content>
                </Card>
            </ScrollView>

            <View style={styles.footer}>
                <Button mode='contained' onPress={start} style={styles.startButton}>
                    Start 2nd Innings
                </Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },

    scroll: {
        flex: 1,
    },

    scrollContent: {
        paddingHorizontal: Spacing.defaultSpace,
        paddingTop: 8,
        paddingBottom: Spacing.defaultSpace,
        gap: 12,
    },

    cardTitle: {
        marginBottom: 6,
    },

    footer: {
        backgroundColor: Colors.white,
        borderTopWidth: 2,
        borderTopColor: Colors.gray,
        gap: 12,
        paddingHorizontal: Spacing.defaultSpace,
        paddingTop: 10,
        paddingBottom: 14,
    },

    startButton: {
        marginTop: 0,
    },
});
