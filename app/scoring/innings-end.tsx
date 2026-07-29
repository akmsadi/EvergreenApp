import AppHeader from "@/components/AppHeader";
import { Colors } from "@/constants/colors";
import { Spacing } from "@/constants/spacing";
import ScoreEngine from "@/features/scoring/engine/ScoreEngine";

import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";

export default function EndInningsScreen() {
    const router = useRouter();
    async function confirmEndInnings() {
        const { inningsNumber, matchId } = await ScoreEngine.endInnings();
        if (inningsNumber === 1) {
            router.replace({
                pathname: "/scoring/second-innings",
                params: { matchId },
            });
            return;
        }
        await ScoreEngine.finishMatch();
        router.push(`/matches/${matchId}/summary`);
    }

    return (
        <>
            <AppHeader showBack />

            <View style={styles.container}>
                <Card>
                    <Card.Content>
                        <Text variant='titleLarge'>End Current Innings?</Text>

                        <Text style={styles.message}>This action cannot be undone.</Text>
                    </Card.Content>
                </Card>

                <Button mode='contained' onPress={confirmEndInnings}>
                    Confirm End Innings
                </Button>

                <Button mode='outlined' onPress={() => router.back()}>
                    Cancel
                </Button>
            </View>
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

    message: {
        marginTop: 8,
    },
});
