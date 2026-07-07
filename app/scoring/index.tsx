import AppHeader from "@/components/AppHeader";
import ScoreEngine from "@/features/scoring/engine/ScoreEngine";
import { InningsBattingModel } from "@/features/scoring/models/InningsBattingModel";
import { InningsBowlingModel } from "@/features/scoring/models/InningsBowlingModel";
import DeliveryRepository from "@/features/scoring/repositories/DeliveryRepository";
import InningsBattingRepository from "@/features/scoring/repositories/InningsBattingRepository";
import InningsBowlingRepository from "@/features/scoring/repositories/InningsBowlingRepository";
import { DismissalType } from "@/features/scoring/types/DismissalType";

import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Divider, Text, TextInput } from "react-native-paper";

import { ScoreboardState } from "@/features/scoring/models/ScoreboardState";
import { ExtraType } from "@/features/scoring/types/ExtraType";

export default function ScoringScreen() {
    const router = useRouter();

    const [scoreboard, setScoreboard] = useState<ScoreboardState | null>(null);
    const [strikerStats, setStrikerStats] = useState<InningsBattingModel | null>(null);
    const [nonStrikerStats, setNonStrikerStats] = useState<InningsBattingModel | null>(null);
    const [bowlerStats, setBowlerStats] = useState<InningsBowlingModel | null>(null);
    const [lastSixBalls, setLastSixBalls] = useState<string[]>([]);
    const [noBallRunsInput, setNoBallRunsInput] = useState("");
    const [wicketRunsInput, setWicketRunsInput] = useState("0");

    useFocusEffect(
        useCallback(() => {
            loadScoreboard();
        }, []),
    );

    async function loadScoreboard() {
        const state = await ScoreEngine.getScoreboard();

        setScoreboard(state);

        setStrikerStats(InningsBattingRepository.find(state.inningsId, state.strikerId));
        setNonStrikerStats(InningsBattingRepository.find(state.inningsId, state.nonStrikerId));
        setBowlerStats(InningsBowlingRepository.find(state.inningsId, state.bowlerId));
        setLastSixBalls(DeliveryRepository.findLastBallCommentaries(state.inningsId, 6));
    }

    async function score(runs: number) {
        await ScoreEngine.scoreBall({
            runs,
        });

        await loadScoreboard();

        if (ScoreEngine.isEndOfOver()) {
            router.push("/scoring/bowler");
        }
    }

    async function wide(runs: number) {
        await ScoreEngine.scoreBall({
            runs: 0,

            extraType: ExtraType.WIDE,

            extraRuns: runs,
        });

        await loadScoreboard();
    }

    async function noBall(runsOffBat: number) {
        await ScoreEngine.scoreBall({
            runs: runsOffBat,

            extraType: ExtraType.NO_BALL,

            extraRuns: 1,
        });

        await loadScoreboard();
    }

    async function submitNoBall() {
        const parsedRuns = Number(noBallRunsInput);

        if (!Number.isFinite(parsedRuns) || parsedRuns < 0) {
            return;
        }

        await noBall(parsedRuns);
        setNoBallRunsInput("0");
    }

    async function submitWicket() {
        const parsedRuns = Number(wicketRunsInput);

        if (!Number.isFinite(parsedRuns) || parsedRuns < 0) {
            return;
        }

        await ScoreEngine.scoreBall({
            runs: parsedRuns,

            isWicket: true,
        });

        await loadScoreboard();
        setWicketRunsInput("0");

        router.push("/scoring/wicket");
    }

    async function noBallRunOut() {
        const parsedRuns = Number(noBallRunsInput);

        if (!Number.isFinite(parsedRuns) || parsedRuns < 0) {
            return;
        }

        await ScoreEngine.scoreBall({
            runs: parsedRuns,

            extraType: ExtraType.NO_BALL,

            extraRuns: 1,

            isWicket: true,

            dismissalType: DismissalType.RUN_OUT,
        });

        await loadScoreboard();
        setNoBallRunsInput("0");

        router.push("/scoring/wicket");
    }

    async function undo() {
        await ScoreEngine.undo();

        await loadScoreboard();
    }

    async function swapStrike() {
        await ScoreEngine.swapStrike();
        await loadScoreboard();
    }

    return (
        <View style={styles.container}>
            <AppHeader
                title='Scoreboard'
                subtitle={
                    scoreboard?.inningsNumber === 2 && scoreboard.targetRuns
                        ? `Target: ${scoreboard.targetRuns} • Need ${Math.max(scoreboard.targetRuns - scoreboard.totalRuns, 0)} runs`
                        : undefined
                }
            />

            <ScrollView contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}>
                <Card>
                    <Card.Content>
                        <View style={styles.topPanelRow}>
                            <View>
                                <Text variant='titleMedium'>Run/Wicket</Text>

                                <Text variant='headlineMedium'>
                                    {scoreboard?.totalRuns ?? 0}/{scoreboard?.wickets ?? 0}
                                </Text>
                            </View>

                            <View>
                                <Text variant='titleMedium'>Overs</Text>

                                <Text variant='headlineSmall'>{scoreboard?.overs ?? "0.0"}</Text>
                            </View>
                        </View>
                    </Card.Content>
                </Card>

                <Card>
                    <Card.Content>
                        <View style={styles.batsmanRow}>
                            <Text style={styles.batsmanName}>{`${scoreboard?.strikerName ?? "Unknown"} *`}</Text>

                            <Text style={styles.batsmanScore}>{strikerStats ? `${strikerStats.runs} (${strikerStats.balls})` : "0 (0)"}</Text>
                        </View>

                        <View style={styles.batsmanRow}>
                            <Text style={styles.batsmanName}>{scoreboard?.nonStrikerName ?? "Unknown"}</Text>

                            <Text style={styles.batsmanScore}>{nonStrikerStats ? `${nonStrikerStats.runs} (${nonStrikerStats.balls})` : "0 (0)"}</Text>
                        </View>

                        <Divider style={styles.divider} />

                        <View style={styles.batsmanRow}>
                            <Text style={styles.batsmanName}>{scoreboard?.bowlerName ?? "Unknown"}</Text>

                            <Text style={styles.bowlerScore}>
                                {bowlerStats ? `${bowlerStats.wickets}/${bowlerStats.runs} ` : "0/0 "}
                                <Text style={styles.bowlerScoreMuted}>{`(${bowlerStats?.balls ?? 0})`}</Text>
                            </Text>
                        </View>

                        <Button mode='outlined' onPress={swapStrike} style={styles.inlineAction}>
                            Swap Strike
                        </Button>

                        <View style={styles.lastSixRow}>
                            <Text style={styles.lastSixLabel}>Last 6</Text>

                            <View style={styles.lastSixBallsWrap}>
                                {(lastSixBalls.length > 0 ? lastSixBalls : ["-"]).map((ball, index) => (
                                    <View key={`${ball}-${index}`} style={styles.ballChip}>
                                        <Text style={styles.ballChipText}>{ball}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </Card.Content>
                </Card>

                <Card>
                    <Card.Content>
                        <Text variant='titleMedium' style={styles.actionSectionTitle}>
                            Runs
                        </Text>

                        <View style={styles.buttonGrid}>
                            <Button mode='contained' onPress={() => score(0)} style={styles.scoreButton}>
                                0
                            </Button>

                            <Button mode='contained' onPress={() => score(1)} style={styles.scoreButton}>
                                1
                            </Button>

                            <Button mode='contained' onPress={() => score(2)} style={styles.scoreButton}>
                                2
                            </Button>

                            <Button mode='contained' onPress={() => score(3)} style={styles.scoreButton}>
                                3
                            </Button>

                            <Button mode='contained' onPress={() => score(4)} style={styles.scoreButton}>
                                4
                            </Button>

                            <Button mode='contained' onPress={() => score(6)} style={styles.scoreButton}>
                                6
                            </Button>

                            <Button mode='outlined' onPress={() => wide(1)} style={styles.scoreButton}>
                                Wide
                            </Button>

                            <Button mode='contained-tonal' onPress={undo} style={styles.scoreButton}>
                                Undo
                            </Button>
                        </View>
                    </Card.Content>
                </Card>

                <Card>
                    <Card.Content>
                        <View style={styles.actionBlock}>
                            <View style={styles.noBallControls}>
                                <TextInput
                                    mode='flat'
                                    value={noBallRunsInput}
                                    onChangeText={setNoBallRunsInput}
                                    keyboardType='number-pad'
                                    placeholder='Bat Runs'
                                    style={styles.noBallInput}
                                />

                                <Button mode='text' onPress={submitNoBall} style={styles.noBallButton} contentStyle={styles.noBallButtonContent}>
                                    No Ball
                                </Button>
                            </View>

                            <Button mode='contained-tonal' onPress={noBallRunOut} style={styles.fullWidthActionButton}>
                                No Ball + Run Out
                            </Button>
                        </View>
                    </Card.Content>
                </Card>

                <Card>
                    <Card.Content>
                        <View style={styles.wicketSection}>
                            <Text variant='labelLarge' style={styles.actionLabel}>
                                Standard Wicket
                            </Text>

                            <View style={styles.wicketControls}>
                                <TextInput
                                    mode='flat'
                                    label='Completed Runs'
                                    value={wicketRunsInput}
                                    onChangeText={setWicketRunsInput}
                                    keyboardType='number-pad'
                                    style={styles.wicketInput}
                                />

                                <Button mode='text' onPress={submitWicket} style={styles.wicketButton} contentStyle={styles.wicketButtonContent}>
                                    Wicket
                                </Button>
                            </View>
                        </View>
                    </Card.Content>
                </Card>
            </ScrollView>

            <View style={styles.footer}>
                <Button mode='contained' onPress={() => router.push("/scoring/bowler")} style={styles.footerButton}>
                    Change Bowler
                </Button>

                <Button mode='outlined' onPress={() => router.push("/scoring/innings-end")} style={styles.footerButton}>
                    End Innings
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

    divider: {
        marginVertical: 12,
    },

    topPanelRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    batsmanRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },

    batsmanName: {
        flex: 1,
        fontSize: 16,
        fontWeight: "500",
    },

    batsmanScore: {
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 12,
    },

    bowlerScore: {
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 12,
    },

    bowlerScoreMuted: {
        opacity: 0.7,
    },

    lastSixRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
        gap: 10,
    },

    lastSixLabel: {
        fontWeight: "600",
        minWidth: 48,
    },

    lastSixBallsWrap: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
        flex: 1,
    },

    ballChip: {
        backgroundColor: "#eceff1",
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },

    ballChipText: {
        fontWeight: "600",
        fontSize: 12,
    },

    inlineAction: {
        marginTop: 12,
    },

    actionSectionTitle: {
        marginBottom: 12,
    },

    actionBlock: {
        marginTop: 14,
        gap: 10,
    },

    actionLabel: {
        fontWeight: "700",
    },

    actionHelpText: {
        opacity: 0.7,
        lineHeight: 18,
    },

    buttonGrid: {
        flexDirection: "row",

        flexWrap: "wrap",

        justifyContent: "space-between",

        gap: 10,
    },

    scoreButton: {
        width: "30%",
    },

    noBallControls: {
        flex: 1,
        flexDirection: "row",
        alignItems: "stretch",
        borderWidth: 1,
        borderColor: "#bdbdbd",
        borderRadius: 8,
        overflow: "hidden",
        backgroundColor: "#fff",
    },

    noBallInput: {
        flex: 1,
        height: 48,
        backgroundColor: "transparent",
    },

    noBallButton: {
        flex: 1,
        borderLeftWidth: 1,
        borderLeftColor: "#bdbdbd",
        borderRadius: 0,
        justifyContent: "center",
    },

    noBallButtonContent: {
        height: 48,
    },

    wicketSection: {
        gap: 10,
    },

    wicketControls: {
        width: "100%",
        flexDirection: "row",
        alignItems: "stretch",
        borderWidth: 1,
        borderColor: "#bdbdbd",
        borderRadius: 8,
        overflow: "hidden",
        backgroundColor: "#fff",
    },

    wicketInput: {
        flex: 1,
        height: 48,
        backgroundColor: "transparent",
    },

    wicketButton: {
        flex: 1,
        borderLeftWidth: 1,
        borderLeftColor: "#bdbdbd",
        borderRadius: 0,
        justifyContent: "center",
    },

    wicketButtonContent: {
        height: 48,
    },

    fullWidthActionButton: {
        width: "100%",
    },

    footer: {
        flexDirection: "row",
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: "#e0e0e0",
        backgroundColor: "#fff",
    },

    footerButton: {
        flex: 1,
    },
});
