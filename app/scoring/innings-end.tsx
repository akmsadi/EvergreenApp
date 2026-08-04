import { Colors } from "@/constants/colors";
import { Spacing } from "@/constants/spacing";
import ScoreEngine from "@/features/scoring/engine/ScoreEngine";

import { useRouter } from "expo-router";
import React from "react";
import { ImageBackground, StyleSheet, View } from "react-native";
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
        <ImageBackground source={require("@/assets/images/background-stadium.webp")} style={styles.background} resizeMode='cover'>
            <View style={styles.container}>
                <Card style={styles.card}>
                    <Card.Content style={styles.cardContent}>
                        <Text variant='titleMedium' style={styles.title}>
                            End Current Innings?
                        </Text>
                        <Text style={styles.description}>This action cannot be undone.</Text>

                        <Button mode='contained' onPress={confirmEndInnings} style={[styles.button, styles.primaryButton]} contentStyle={styles.buttonContent}>
                            Confirm End Innings
                        </Button>

                        <Button
                            mode='contained'
                            onPress={() => router.back()}
                            style={[styles.button, styles.secondaryButton]}
                            contentStyle={styles.buttonContent}
                        >
                            Cancel
                        </Button>
                    </Card.Content>
                </Card>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: "100%",
    },

    container: {
        flex: 1,
        justifyContent: "center",
        padding: Spacing.defaultSpace,
    },

    card: {
        backgroundColor: "rgba(0,0,0,0.65)",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.3)",
    },

    cardContent: {
        gap: 12,
        padding: Spacing.defaultSpace,
    },

    title: {
        textAlign: "center",
        color: Colors.white,
    },

    description: {
        textAlign: "center",
        color: Colors.white,
        opacity: 0.9,
    },

    button: {
        borderRadius: 8,
    },

    buttonContent: {
        height: 48,
    },

    primaryButton: {
        backgroundColor: Colors.danger,
    },

    secondaryButton: {
        borderColor: "rgba(255,255,255,0.5)",
    },
});
