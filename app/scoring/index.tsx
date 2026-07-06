import AppHeader from "@/components/AppHeader";
import ScoreEngine from "@/features/scoring/engine/ScoreEngine";

import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Divider, Text } from "react-native-paper";

import { ScoreboardState } from "@/features/scoring/models/ScoreboardState";
import { ExtraType } from "@/features/scoring/types/ExtraType";

export default function ScoringScreen() {
    const router = useRouter();

    const [scoreboard, setScoreboard] = useState<ScoreboardState | null>(null);

    useFocusEffect(
        useCallback(() => {
            loadScoreboard();
        }, []),
    );

    async function loadScoreboard() {
        const state = await ScoreEngine.getScoreboard();

        setScoreboard(state);
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

    async function wide() {
        await ScoreEngine.scoreBall({
            runs: 0,

            extraType: ExtraType.WIDE,

            extraRuns: 1,
        });

        await loadScoreboard();
    }

    async function noBall() {
        await ScoreEngine.scoreBall({
            runs: 0,

            extraType: ExtraType.NO_BALL,

            extraRuns: 1,
        });

        await loadScoreboard();
    }

    async function bye() {
        await ScoreEngine.scoreBall({
            runs: 1,

            extraType: ExtraType.BYE,

            extraRuns: 1,
        });

        await loadScoreboard();
    }

    async function legBye() {
        await ScoreEngine.scoreBall({
            runs: 1,

            extraType: ExtraType.LEG_BYE,

            extraRuns: 1,
        });

        await loadScoreboard();
    }

    async function wicket() {
        await ScoreEngine.scoreBall({
            runs: 0,

            isWicket: true,
        });

        await loadScoreboard();

        router.push("/scoring/wicket");
    }

    async function undo() {
        await ScoreEngine.undo();

        await loadScoreboard();
    }

    return (
        <>
            <AppHeader title='Live Scoring' />

            <ScrollView contentContainerStyle={styles.container}>
                <Card>
                    <Card.Content>
                        <Text variant='headlineMedium'>
                            {scoreboard?.totalRuns ?? 0}/{scoreboard?.wickets ?? 0}
                        </Text>

                        <Text>Overs : {scoreboard?.overs ?? "0.0"}</Text>

                        <Text>Run Rate : {scoreboard?.runRate ?? 0}</Text>
                    </Card.Content>
                </Card>

                <Card>
                    <Card.Content>
                        <Text variant='titleMedium'>Striker</Text>

                        <Text>{scoreboard?.strikerName}</Text>

                        <Divider style={styles.divider} />

                        <Text variant='titleMedium'>Non Striker</Text>

                        <Text>{scoreboard?.nonStrikerName}</Text>

                        <Divider style={styles.divider} />

                        <Text variant='titleMedium'>Bowler</Text>

                        <Text>{scoreboard?.bowlerName}</Text>
                    </Card.Content>
                </Card>

                <Card>
                    <Card.Content>
                        <Text variant='titleMedium'>Last Ball</Text>

                        <Text variant='headlineSmall'>{scoreboard?.lastBall ?? "-"}</Text>
                    </Card.Content>
                </Card>

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

                    <Button mode='outlined' onPress={wide} style={styles.scoreButton}>
                        WD
                    </Button>

                    <Button mode='outlined' onPress={noBall} style={styles.scoreButton}>
                        NB
                    </Button>

                    <Button mode='outlined' onPress={bye} style={styles.scoreButton}>
                        B
                    </Button>

                    <Button mode='outlined' onPress={legBye} style={styles.scoreButton}>
                        LB
                    </Button>

                    <Button mode='contained-tonal' onPress={wicket} style={styles.scoreButton}>
                        W
                    </Button>

                    <Button mode='contained-tonal' onPress={undo} style={styles.scoreButton}>
                        Undo
                    </Button>

                    <Button mode='contained' onPress={() => router.push("/scoring/bowler")}>
                        Change Bowler
                    </Button>

                    <Button mode='outlined' onPress={() => router.push("/scoring/innings-end")}>
                        End Innings
                    </Button>
                </View>
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        gap: 16,
    },

    divider: {
        marginVertical: 12,
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
});
