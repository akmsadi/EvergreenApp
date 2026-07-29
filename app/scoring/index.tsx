import AppHeader from "@/components/AppHeader";
import { Colors } from "@/constants/colors";
import { Spacing } from "@/constants/spacing";
import ScoreEngine from "@/features/scoring/engine/ScoreEngine";
import { InningsBattingModel } from "@/features/scoring/models/InningsBattingModel";
import { InningsBowlingModel } from "@/features/scoring/models/InningsBowlingModel";
import { ScoreboardState } from "@/features/scoring/models/ScoreboardState";
import DeliveryRepository from "@/features/scoring/repositories/DeliveryRepository";
import InningsBattingRepository from "@/features/scoring/repositories/InningsBattingRepository";
import InningsBowlingRepository from "@/features/scoring/repositories/InningsBowlingRepository";
import { DismissalType } from "@/features/scoring/types/DismissalType";
import { ExtraType } from "@/features/scoring/types/ExtraType";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { Button, Checkbox, Divider, Text, TextInput } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ScoringScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [scoreboard, setScoreboard] = useState<ScoreboardState | null>(null);
    const [strikerStats, setStrikerStats] = useState<InningsBattingModel | null>(null);
    const [nonStrikerStats, setNonStrikerStats] = useState<InningsBattingModel | null>(null);
    const [bowlerStats, setBowlerStats] = useState<InningsBowlingModel | null>(null);
    const [thisOverBalls, setThisOverBalls] = useState<string[]>([]);
    const [noBallRunsInput, setNoBallRunsInput] = useState("");
    const [wicketRunsInput, setWicketRunsInput] = useState("0");
    const [autoSwapDisabled, setAutoSwapDisabled] = useState(!ScoreEngine.isAutoSwapEnabled());

    const targetSummary =
        scoreboard?.inningsNumber === 2 && scoreboard.targetRuns
            ? `Target: ${scoreboard.targetRuns} • Need ${Math.max(scoreboard.targetRuns - scoreboard.totalRuns, 0)} runs`
            : undefined;

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
        setThisOverBalls(DeliveryRepository.findCurrentOverCommentaries(state.inningsId));
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

    async function wideWicket() {
        await ScoreEngine.scoreBall({
            runs: 0,

            extraType: ExtraType.WIDE,

            extraRuns: 1,

            isWicket: true,

            dismissalType: DismissalType.STUMPED,
        });

        await loadScoreboard();

        router.push("/scoring/wicket");
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

    function submitWicket() {
        const parsedRuns = Number(wicketRunsInput);

        if (!Number.isFinite(parsedRuns) || parsedRuns < 0) {
            return;
        }

        setWicketRunsInput("0");

        router.push({
            pathname: "/scoring/wicket",
            params: { pendingRuns: String(parsedRuns) },
        });
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

    function undo() {
        Alert.alert("Undo last ball", "Are you sure you want to undo the last ball?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Undo",
                style: "destructive",
                onPress: async () => {
                    await ScoreEngine.undo();
                    await loadScoreboard();
                },
            },
        ]);
    }

    async function swapStrike() {
        await ScoreEngine.swapStrike();
        await loadScoreboard();
    }

    function toggleAutoSwap() {
        const disabled = !autoSwapDisabled;
        ScoreEngine.setAutoSwapEnabled(!disabled);
        setAutoSwapDisabled(disabled);
    }

    return (
        <View style={styles.container}>
            <AppHeader />
            {targetSummary && (
                <View style={{ padding: Spacing.defaultSpace, borderBottomWidth: 1, borderBottomColor: Colors.darkGray }}>
                    <Text variant='titleMedium' style={{ textAlign: "center" }}>
                        {targetSummary}
                    </Text>
                </View>
            )}
            <ScrollView contentContainerStyle={{ padding: Spacing.defaultSpace, gap: 16 }}>
                <View style={styles.topPanelRow}>
                    <Text variant='headlineSmall'>
                        Score: {scoreboard?.totalRuns ?? 0}/{scoreboard?.wickets ?? 0}
                    </Text>
                    <Text>({scoreboard?.overs ?? "0.0"} overs)</Text>
                </View>
                <View>
                    <View style={styles.batsmanRow}>
                        <View style={styles.batsmanInfo}>
                            <MaterialCommunityIcons name='cricket' size={14} color='#2E7D32' style={styles.batIcon} />
                            <Text style={styles.batsmanName}>{scoreboard?.strikerName ?? "Unknown"} *</Text>
                        </View>
                        <Text style={styles.batsmanScore}>{strikerStats ? `${strikerStats.runs} (${strikerStats.balls})` : "0 (0)"}</Text>
                    </View>

                    <View style={styles.batsmanRow}>
                        <View style={styles.batsmanInfo}>
                            <MaterialCommunityIcons name='cricket' size={14} color='#2E7D32' style={styles.batIcon} />
                            <Text style={styles.batsmanName}>{scoreboard?.nonStrikerName ?? "Unknown"}</Text>
                        </View>
                        <Text style={styles.batsmanScore}>{nonStrikerStats ? `${nonStrikerStats.runs} (${nonStrikerStats.balls})` : "0 (0)"}</Text>
                    </View>

                    <Divider style={[styles.divider, { marginBottom: 8 }]} />

                    <View style={styles.batsmanRow}>
                        <View style={styles.batsmanInfo}>
                            <MaterialCommunityIcons name='baseball' size={14} color='#2E7D32' style={styles.batIcon} />
                            <Text style={styles.batsmanName}>{scoreboard?.bowlerName ?? "Unknown"}</Text>
                        </View>

                        <Text style={styles.bowlerScore}>
                            {bowlerStats ? `${bowlerStats.wickets}/${bowlerStats.runs} ` : "0/0 "}
                            <Text style={styles.bowlerScoreMuted}>{`(${bowlerStats?.balls ?? 0})`}</Text>
                        </Text>
                    </View>

                    <View style={styles.swapStrikeRow}>
                        <Checkbox.Item
                            label='Disable Auto Swap'
                            status={autoSwapDisabled ? "checked" : "unchecked"}
                            onPress={toggleAutoSwap}
                            style={styles.autoSwapCheckbox}
                            labelStyle={styles.autoSwapCheckboxLabel}
                        />

                        <Button mode='contained' icon='sync' onPress={swapStrike} style={styles.swapStrikeButton}>
                            Swap
                        </Button>
                    </View>

                    <View style={styles.lastSixRow}>
                        <Text style={styles.lastSixLabel}>This Over:</Text>
                        <View style={styles.lastSixBallsWrap}>
                            {(thisOverBalls.length > 0 ? thisOverBalls : ["-"]).map((ball, index) => (
                                <View key={`${ball}-${index}`} style={styles.ballChip}>
                                    <Text style={styles.ballChipText}>{ball}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
                <Divider style={styles.divider} />

                <View style={styles.scoringArea}>
                    {/* Left actions */}
                    <View style={styles.sideActions}>
                        <Button
                            mode='outlined'
                            icon='cricket'
                            onPress={() => router.push("/scoring/change-batsman")}
                            style={styles.sideActionButton}
                            contentStyle={styles.sideActionContent}
                        >
                            Change
                        </Button>

                        <Button
                            mode='outlined'
                            icon='baseball'
                            onPress={() => router.push("/scoring/bowler")}
                            style={styles.sideActionButton}
                            contentStyle={styles.sideActionContent}
                        >
                            Change
                        </Button>

                        <Button mode='contained-tonal' icon='undo' onPress={undo} style={styles.sideActionButton} contentStyle={styles.sideActionContent}>
                            Undo
                        </Button>
                    </View>

                    {/* Score buttons */}
                    <View style={styles.scoreGrid}>
                        <Button mode='contained' style={styles.scoreButton} contentStyle={styles.scoreButtonContent} onPress={() => score(0)}>
                            0
                        </Button>

                        <Button mode='contained' style={styles.scoreButton} contentStyle={styles.scoreButtonContent} onPress={() => score(1)}>
                            1
                        </Button>

                        <Button mode='contained' style={styles.scoreButton} contentStyle={styles.scoreButtonContent} onPress={() => score(2)}>
                            2
                        </Button>

                        <Button mode='contained' style={styles.scoreButton} contentStyle={styles.scoreButtonContent} onPress={() => score(3)}>
                            3
                        </Button>

                        <Button mode='contained' style={styles.scoreButton} contentStyle={styles.scoreButtonContent} onPress={() => score(4)}>
                            4
                        </Button>

                        <Button mode='contained' style={styles.scoreButton} contentStyle={styles.scoreButtonContent} onPress={() => score(6)}>
                            6
                        </Button>

                        <Button mode='contained' style={styles.scoreButton} contentStyle={styles.scoreButtonContent} onPress={() => wide(1)}>
                            WD
                        </Button>

                        <Button
                            mode='contained'
                            style={styles.wideWicketButton}
                            contentStyle={styles.scoreButtonContent}
                            labelStyle={styles.wideWicketLabel}
                            onPress={wideWicket}
                        >
                            WD + WK
                        </Button>
                    </View>
                </View>

                <View style={styles.actionBlock}>
                    <View style={styles.noBallControls}>
                        <TextInput
                            mode='flat'
                            value={noBallRunsInput}
                            onChangeText={setNoBallRunsInput}
                            keyboardType='number-pad'
                            placeholder='Runs'
                            style={styles.noBallInput}
                        />

                        <Button mode='text' onPress={submitNoBall} style={styles.noBallButton} contentStyle={styles.noBallButtonContent}>
                            No Ball
                        </Button>
                    </View>

                    <Button mode='contained' onPress={noBallRunOut} style={styles.fullWidthActionButton}>
                        No Ball + Run Out
                    </Button>
                </View>
                <View>
                    <View style={styles.wicketSection}>
                        <View style={styles.wicketControls}>
                            <TextInput
                                mode='flat'
                                value={wicketRunsInput}
                                onChangeText={setWicketRunsInput}
                                keyboardType='number-pad'
                                style={styles.wicketInput}
                                placeholder='Completed Runs'
                            />

                            <Button mode='text' onPress={submitWicket} style={styles.wicketButton} contentStyle={styles.wicketButtonContent}>
                                Wicket
                            </Button>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View style={[styles.footer, { height: 45 + insets.bottom }]}>
                <Button mode='outlined' onPress={() => router.push("/scoring/innings-end")} style={[styles.footerButton, { flex: 1 }]}>
                    End Innings
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

    divider: {
        // marginVertical: 2,
    },

    topPanelRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    bowlerScore: {
        fontSize: 14,
        fontWeight: "600",
        marginLeft: 12,
    },

    bowlerScoreMuted: {
        opacity: 0.7,
    },

    lastSixRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },

    lastSixLabel: {
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

    swapStrikeRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    autoSwapCheckbox: {
        flex: 1,
        paddingHorizontal: 0,
    },

    autoSwapCheckboxLabel: {
        fontSize: 14,
    },

    swapStrikeButton: {
        marginLeft: 8,
        borderRadius: 8,
    },

    actionBlock: {
        gap: 10,
    },

    actionLabel: {
        fontWeight: "700",
    },

    actionHelpText: {
        opacity: 0.7,
        lineHeight: 18,
    },

    noBallControls: {
        flex: 1,
        flexDirection: "row",
        alignItems: "stretch",
        borderWidth: 1,
        borderColor: Colors.darkGray,
        borderRadius: 8,
        overflow: "hidden",
        backgroundColor: Colors.white,
    },

    noBallInput: {
        flex: 1,
        height: 40,
        backgroundColor: "transparent",
    },

    noBallButton: {
        flex: 1,
        borderLeftWidth: 1,
        borderLeftColor: Colors.darkGray,
        borderRadius: 0,
        justifyContent: "center",
    },

    noBallButtonContent: {
        height: 40,
    },

    wicketSection: {
        gap: 10,
    },

    wicketControls: {
        width: "100%",
        flexDirection: "row",
        alignItems: "stretch",
        borderWidth: 1,
        borderColor: Colors.darkGray,
        borderRadius: 8,
        overflow: "hidden",
        backgroundColor: "#fff",
    },

    wicketInput: {
        flex: 1,
        height: 40,
        backgroundColor: "transparent",
    },

    wicketButton: {
        flex: 1,
        borderLeftWidth: 1,
        borderLeftColor: Colors.darkGray,
        borderRadius: 0,
        justifyContent: "center",
    },

    wicketButtonContent: {
        height: 40,
    },

    fullWidthActionButton: {
        width: "100%",
        borderRadius: 8,
    },

    footer: {
        flexDirection: "row",
        gap: 10,
        padding: Spacing.defaultSpace,
        backgroundColor: Colors.white,
    },

    footerButton: {
        borderRadius: 8,
    },

    batsmanRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },

    batsmanName: {
        fontSize: 14,
    },

    batsmanScore: {
        fontSize: 14,
    },

    batsmanInfo: {
        flexDirection: "row",
        alignItems: "center",
    },

    batIcon: {
        marginRight: 6,
    },

    scoringArea: { flexDirection: "row", gap: 10, alignItems: "stretch" },
    sideActions: { flex: 3.5, gap: 8 },
    sideActionButton: { flex: 1, borderRadius: 8, justifyContent: "center" },
    sideActionContent: { flex: 1 },
    scoreGrid: { flex: 6.5, flexDirection: "row", flexWrap: "wrap", gap: 8 },
    scoreButton: { flexGrow: 1, flexBasis: "30%", minWidth: 0, minHeight: 44, borderRadius: 8, margin: 0 },
    scoreButtonContent: { minHeight: 44, paddingHorizontal: 0 },
    scoreButtonLabel: { fontSize: 14, marginHorizontal: 0 },
    wideWicketButton: { flexGrow: 2, flexBasis: "60%", minWidth: 0, minHeight: 44, borderRadius: 8, margin: 0 },
    wideWicketLabel: { fontSize: 13, marginHorizontal: 0 },
});
