import AppHeader from "@/components/AppHeader";
import ScoreEngine from "@/features/scoring/engine/ScoreEngine";

import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";

export default function EndInningsScreen() {
    const router = useRouter();

    async function confirmEndInnings() {
        await ScoreEngine.endInnings();

        // We'll replace this after second innings is implemented.
        router.replace("/");
    }

    return (
        <>
            <AppHeader title='End Innings' showBack />

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

        padding: 16,

        justifyContent: "center",

        gap: 16,
    },

    message: {
        marginTop: 8,
    },
});
