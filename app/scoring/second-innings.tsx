import AppHeader from "@/components/AppHeader";
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
import { Dropdown } from "react-native-paper-dropdown";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SecondInningsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { matchId } = useLocalSearchParams();

    const matchIdNum = Number(matchId);

    const [match, setMatch] = useState<any>();

    const [battingTeam, setBattingTeam] = useState<"team_a" | "team_b">("team_a");
    const [target, setTarget] = useState<number>(0);

    const [battingPlayers, setBattingPlayers] = useState<any[]>([]);
    const [bowlingPlayers, setBowlingPlayers] = useState<any[]>([]);

    const [strikerId, setStrikerId] = useState<string>();
    const [nonStrikerId, setNonStrikerId] = useState<string>();
    const [bowlerId, setBowlerId] = useState<string>();
    const [strikerIdError, setStrikerIdError] = useState("");
    const [nonStrikerIdError, setNonStrikerIdError] = useState("");
    const [bowlerIdError, setBowlerIdError] = useState("");

    useEffect(() => {
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
    }, [matchIdNum]);

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
        setStrikerIdError("");
        setNonStrikerIdError("");
        setBowlerIdError("");
        if (!strikerId || !nonStrikerId || !bowlerId) {
            if (!strikerId) setStrikerIdError("Select striker");
            if (!nonStrikerId) setNonStrikerIdError("Select non-striker");
            if (!bowlerId) setBowlerIdError("Select bowler");
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
            <AppHeader />

            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                <Text variant='titleLarge' style={[styles.cardTitle, { textAlign: "center" }]}>
                    {battingTeamName ?? "Batting team"} need {target} to win
                </Text>

                <Card style={{ backgroundColor: Colors.white, marginBottom: 8 }}>
                    <Card.Content>
                        <Text variant='titleMedium' style={styles.cardTitle}>
                            Opening Batsman
                        </Text>

                        <Dropdown
                            mode='outlined'
                            label='Striker'
                            value={strikerId}
                            options={strikerOptions}
                            onSelect={(value) => {
                                setStrikerId(value);
                                if (value === nonStrikerId) {
                                    setNonStrikerId(undefined);
                                }
                            }}
                            error={!!strikerIdError}
                        />

                        <Dropdown
                            mode='outlined'
                            label='Non-striker'
                            value={nonStrikerId}
                            options={nonStrikerOptions}
                            onSelect={setNonStrikerId}
                            error={!!nonStrikerIdError}
                        />
                    </Card.Content>
                </Card>

                <Card style={{ backgroundColor: Colors.white, marginBottom: 8 }}>
                    <Card.Content>
                        <Text variant='titleMedium' style={styles.cardTitle}>
                            Opening Bowler
                        </Text>
                        <Dropdown mode='outlined' label='Bowler' value={bowlerId} options={bowlerOptions} onSelect={setBowlerId} error={!!bowlerIdError} />
                    </Card.Content>
                </Card>
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Spacing.defaultSpace) }]}>
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
        backgroundColor: Colors.background,
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
        borderRadius: 8,
    },
});
