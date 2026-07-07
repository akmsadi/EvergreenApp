import AppHeader from "@/components/AppHeader";
import { Colors } from "@/constants/colors";
import { Spacing } from "@/constants/spacing";

import MatchRepository from "@/database/repositories/MatchRepository";

import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";

export default function Result() {
    const router = useRouter();

    const { matchId } = useLocalSearchParams();

    const [match, setMatch] = useState<any>();

    useEffect(() => {
        setMatch(MatchRepository.find(Number(matchId)));
    }, [matchId]);

    return (
        <View style={styles.container}>
            <AppHeader title='Match Result' />

            <View style={styles.content}>
                <Card style={{ backgroundColor: Colors.white }}>
                    <Card.Content>
                        <Text variant='titleMedium'>
                            {match?.team_name ?? "Team A"} vs {match?.opponent_name ?? "Team B"}
                        </Text>

                        <Text variant='headlineSmall' style={styles.resultText}>
                            {match?.result_summary ?? "Match Completed"}
                        </Text>
                    </Card.Content>
                </Card>

                <Button mode='contained' onPress={() => router.replace("/")}>
                    Back to Dashboard
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

    content: {
        flex: 1,
        padding: Spacing.defaultSpace,
        justifyContent: "center",
        gap: 16,
    },

    resultText: {
        marginTop: 8,
    },
});
