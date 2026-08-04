import AppHeader from "@/components/AppHeader";
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
import { Dropdown } from "react-native-paper-dropdown";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function StartMatchScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { id } = useLocalSearchParams();
    const matchId = Number(id);
    const [match, setMatch] = useState<any>();
    const [teamAPlayers, setTeamAPlayers] = useState<any[]>([]);
    const [teamBPlayers, setTeamBPlayers] = useState<any[]>([]);
    const [tossWinner, setTossWinner] = useState<"team_a" | "team_b">("team_a");
    const [decision, setDecision] = useState<"bat" | "bowl">("bat");
    const [strikerId, setStrikerId] = useState<string>();
    const [nonStrikerId, setNonStrikerId] = useState<string>();
    const [bowlerId, setBowlerId] = useState<string>();
    const [strikerIdError, setStrikerIdError] = useState("");
    const [nonStrikerIdError, setNonStrikerIdError] = useState("");
    const [bowlerIdError, setBowlerIdError] = useState("");

    useEffect(() => {
        const a = MatchPlayerRepository.getTeamPlayers(matchId, "team_a");
        const b = MatchPlayerRepository.getTeamPlayers(matchId, "team_b");
        setMatch(MatchRepository.find(matchId));
        setTeamAPlayers(a.map((id) => PlayerRepository.find(id)).filter(Boolean));
        setTeamBPlayers(b.map((id) => PlayerRepository.find(id)).filter(Boolean));
    }, [matchId]);

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
        setStrikerIdError("");
        setNonStrikerIdError("");
        setBowlerIdError("");
        if (!strikerId || !nonStrikerId || !bowlerId) {
            if (!strikerId) setStrikerIdError("Select striker");
            if (!nonStrikerId) setNonStrikerIdError("Select non-striker");
            if (!bowlerId) setBowlerIdError("Select bowler");
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
            params: { inningsId },
        });
    }

    return (
        <View style={styles.container}>
            <AppHeader showBack />
            <View style={styles.matchCard}>
                <View style={styles.matchRow}>
                    <Text style={styles.matchTitle}>
                        {match?.team_name ?? ""} vs {match?.opponent_name ?? ""}
                    </Text>
                    <Text style={styles.matchDate}>{scheduledDateLabel}</Text>
                </View>

                <View style={styles.matchRow}>
                    <Text style={styles.matchInfo}>
                        {match?.match_type?.toUpperCase?.() ?? "MATCH"} • {match?.format_overs ?? "-"} Overs
                    </Text>
                    <Text style={styles.venue}>Venue: {match?.venue ?? "TBA"}</Text>
                </View>
            </View>

            <View style={styles.divider} />

            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                <Card style={{ backgroundColor: Colors.white }}>
                    <Card.Content>
                        <Text variant='titleMedium' style={{ marginBottom: 8 }}>
                            Toss
                        </Text>

                        <View style={{ marginBottom: 12 }}>
                            <Dropdown
                                label='Winner'
                                mode='outlined'
                                value={tossWinner}
                                options={tossWinnerOptions}
                                onSelect={(value) => {
                                    if (value) {
                                        setTossWinner(value as "team_a" | "team_b");
                                    }
                                }}
                            />
                        </View>
                        <Dropdown
                            label='Decision'
                            mode='outlined'
                            value={decision}
                            options={decisionOptions}
                            onSelect={(value) => {
                                if (value) {
                                    setDecision(value as "bat" | "bowl");
                                }
                            }}
                        />
                    </Card.Content>
                </Card>

                <Card style={{ backgroundColor: Colors.white }}>
                    <Card.Content>
                        <Text variant='titleMedium' style={{ marginBottom: 8 }}>
                            Opening Batsman
                        </Text>

                        <View style={{ marginBottom: 12 }}>
                            <Dropdown
                                label='Striker'
                                mode='outlined'
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
                        </View>

                        <Dropdown
                            label='Non-striker'
                            mode='outlined'
                            value={nonStrikerId}
                            options={nonStrikerOptions}
                            onSelect={setNonStrikerId}
                            error={!!nonStrikerIdError}
                        />
                    </Card.Content>
                </Card>

                <Card style={{ backgroundColor: Colors.white, marginBottom: 8 }}>
                    <Card.Content>
                        <Text variant='titleMedium' style={{ marginBottom: 8 }}>
                            Opening Bowler
                        </Text>

                        <Dropdown label='Bowler' mode='outlined' value={bowlerId} options={bowlerOptions} onSelect={setBowlerId} error={!!bowlerIdError} />
                    </Card.Content>
                </Card>
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Spacing.defaultSpace) }]}>
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
        // color: Colors.textSecondary,
        // marginLeft: 12,
    },

    matchInfo: {
        // color: Colors.textSecondary,
    },

    matchStatus: {
        color: "#1976d2",
        fontWeight: "500",
        textTransform: "capitalize",
    },

    footer: {
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: Colors.darkGray,
        gap: 12,
        padding: Spacing.defaultSpace,
    },

    startButton: {
        borderRadius: 8,
    },

    matchCard: {
        padding: Spacing.defaultSpace,
    },

    divider: {
        height: 1,
        backgroundColor: Colors.darkGray,
        marginBottom: Spacing.defaultSpace,
    },

    venue: {
        fontSize: 14,
        color: "#666",
        fontWeight: "600",
        textAlign: "right",
    },
});
