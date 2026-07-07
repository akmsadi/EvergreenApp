import AppHeader from "@/components/AppHeader";
import AppSelect from "@/components/AppSelect";
import { Colors } from "@/constants/colors";
import { Spacing } from "@/constants/spacing";

import MatchPlayerRepository from "@/database/repositories/MatchPlayerRepository";
import MatchRepository from "@/database/repositories/MatchRepository";
import PlayerRepository from "@/database/repositories/PlayerRepository";

import ScoreEngine from "@/features/scoring/engine/ScoreEngine";
import { formatDisplayDate } from "@/utils/Common";

import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";

export default function StartMatchScreen() {
    const router = useRouter();

    const { id } = useLocalSearchParams();

    const matchId = Number(id);

    const [match, setMatch] = useState<any>();

    const [teamAPlayers, setTeamAPlayers] = useState<any[]>([]);
    const [teamBPlayers, setTeamBPlayers] = useState<any[]>([]);

    const [tossWinner, setTossWinner] = useState<"team_a" | "team_b">("team_a");

    const [decision, setDecision] = useState<"bat" | "bowl">("bat");

    const [strikerId, setStrikerId] = useState<number>();

    const [nonStrikerId, setNonStrikerId] = useState<number>();

    const [bowlerId, setBowlerId] = useState<number>();

    useEffect(() => {
        load();
    }, []);

    function load() {
        const m = MatchRepository.find(matchId);

        setMatch(m);

        const a = MatchPlayerRepository.getTeamPlayers(matchId, "team_a");

        const b = MatchPlayerRepository.getTeamPlayers(matchId, "team_b");

        setTeamAPlayers(
            a
                .map((id) => PlayerRepository.find(id))

                .filter(Boolean),
        );

        setTeamBPlayers(
            b
                .map((id) => PlayerRepository.find(id))

                .filter(Boolean),
        );
    }

    const battingPlayers = useMemo(() => {
        const battingTeam = decision === "bat" ? tossWinner : tossWinner === "team_a" ? "team_b" : "team_a";

        return battingTeam === "team_a" ? teamAPlayers : teamBPlayers;
    }, [decision, tossWinner, teamAPlayers, teamBPlayers]);

    const bowlingPlayers = useMemo(() => {
        const bowlingTeam = decision === "bat" ? (tossWinner === "team_a" ? "team_b" : "team_a") : tossWinner;

        return bowlingTeam === "team_a" ? teamAPlayers : teamBPlayers;
    }, [decision, tossWinner, teamAPlayers, teamBPlayers]);

    const tossWinnerOptions = useMemo(
        () => [
            {
                label: match?.team_name ?? "Team A",
                value: "team_a",
            },
            {
                label: match?.opponent_name ?? "Team B",
                value: "team_b",
            },
        ],
        [match?.team_name, match?.opponent_name],
    );

    const decisionOptions = useMemo(
        () => [
            {
                label: "Bat",
                value: "bat",
            },
            {
                label: "Bowl",
                value: "bowl",
            },
        ],
        [],
    );

    const bowlerOptions = useMemo(
        () =>
            bowlingPlayers.map((player) => ({
                label: player.name,
                value: String(player.id),
            })),
        [bowlingPlayers],
    );

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

    const scheduledDateLabel = useMemo(() => {
        if (!match?.scheduled_at) {
            return "-";
        }

        const date = new Date(match.scheduled_at);

        if (Number.isNaN(date.getTime())) {
            return "-";
        }

        return formatDisplayDate(date);
    }, [match?.scheduled_at]);

    async function start() {
        if (!strikerId || !nonStrikerId || !bowlerId) {
            alert("Select opening players.");

            return;
        }

        const battingTeam = decision === "bat" ? tossWinner : tossWinner === "team_a" ? "team_b" : "team_a";

        const bowlingTeam = battingTeam === "team_a" ? "team_b" : "team_a";

        MatchRepository.updateToss(matchId, tossWinner, decision);

        const inningsId = await ScoreEngine.createInnings({
            matchId,

            battingTeam,

            bowlingTeam,

            strikerId,

            nonStrikerId,

            bowlerId,

            maxOvers: match.format_overs,
        });

        router.replace({
            pathname: "/scoring",

            params: {
                inningsId,
            },
        });
    }

    return (
        <View style={styles.container}>
            <AppHeader title='Start Match' />

            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                <Card style={{ backgroundColor: Colors.white, marginBottom: 8 }}>
                    <Card.Content>
                        <Text variant='titleMedium' style={styles.cardTitle}>
                            Match Details
                        </Text>

                        <View style={styles.matchRow}>
                            <Text style={styles.matchTitle}>
                                {match?.team_name ?? "Team A"} vs {match?.opponent_name ?? "Team B"}
                            </Text>

                            <Text style={styles.matchDate}>{scheduledDateLabel}</Text>
                        </View>

                        <View style={styles.matchRow}>
                            <Text style={styles.matchInfo}>
                                {match?.match_type?.toUpperCase?.() ?? "MATCH"} • {match?.format_overs ?? "-"} Overs
                            </Text>

                            <Text style={styles.matchStatus}>{match?.match_status ?? "scheduled"}</Text>
                        </View>
                    </Card.Content>
                </Card>

                <Card style={{ backgroundColor: Colors.white, marginBottom: 8 }}>
                    <Card.Content>
                        <Text variant='titleMedium' style={styles.cardTitle}>
                            Toss
                        </Text>

                        <View style={styles.tossRow}>
                            <View style={styles.tossCol}>
                                <AppSelect
                                    label='Winner'
                                    value={tossWinnerOptions.find((option) => option.value === tossWinner)?.label ?? ""}
                                    options={tossWinnerOptions}
                                    onChange={(value) => setTossWinner(value as "team_a" | "team_b")}
                                />
                            </View>

                            <View style={styles.tossCol}>
                                <AppSelect
                                    label='Decision'
                                    value={decisionOptions.find((option) => option.value === decision)?.label ?? ""}
                                    options={decisionOptions}
                                    onChange={(value) => setDecision(value as "bat" | "bowl")}
                                />
                            </View>
                        </View>
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
                    Start Match
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

    tossRow: {
        flexDirection: "row",
        gap: 12,
    },

    tossCol: {
        flex: 1,
    },

    matchRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },

    matchTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: "600",
    },

    matchDate: {
        color: Colors.textSecondary,
        marginLeft: 12,
    },

    matchInfo: {
        color: Colors.textSecondary,
    },

    matchStatus: {
        color: "#1976d2",
        fontWeight: "500",
        textTransform: "capitalize",
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
