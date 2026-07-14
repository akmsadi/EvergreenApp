import AppHeader from "@/components/AppHeader";
import { Colors } from "@/constants/colors";
import { Spacing } from "@/constants/spacing";
import MatchPlayerRepository from "@/database/repositories/MatchPlayerRepository";
import PlayerRepository from "@/database/repositories/PlayerRepository";
import ScoreEngine from "@/features/scoring/engine/ScoreEngine";
import InningsRepository from "@/features/scoring/repositories/InningsRepository";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Button, Card, Text } from "react-native-paper";
import { Dropdown } from "react-native-paper-dropdown";

interface BowlerOption {
    label: string;
    value: string;
}

export default function Bowler() {
    const router = useRouter();

    const [options, setOptions] = useState<BowlerOption[]>([]);
    const [selectedBowlerId, setSelectedBowlerId] = useState<string>("");
    const [isEndOfOverChange, setIsEndOfOverChange] = useState(false);

    useEffect(() => {
        load();
    }, []);

    async function load() {
        const scoreboard = await ScoreEngine.getScoreboard();
        const innings = InningsRepository.find(scoreboard.inningsId);
        const isEndOfOver = ScoreEngine.isEndOfOver();

        setIsEndOfOverChange(isEndOfOver);

        if (!innings) {
            return;
        }

        const playerIds = MatchPlayerRepository.getTeamPlayers(innings.match_id, innings.bowling_team);

        const bowlerOptions = playerIds
            .filter((playerId) => playerId !== scoreboard.bowlerId)
            .map((playerId) => {
                const player = PlayerRepository.find(playerId);

                return player
                    ? {
                          label: player.name,
                          value: String(player.id),
                      }
                    : null;
            })
            .filter(Boolean) as BowlerOption[];

        setOptions(bowlerOptions);
    }

    async function onContinue() {
        if (!selectedBowlerId) {
            return;
        }

        await ScoreEngine.changeBowler(selectedBowlerId);
        router.back();
    }

    return (
        <>
            <AppHeader title='Change Bowler' showBack />

            <ScrollView contentContainerStyle={styles.container}>
                <Card style={{ backgroundColor: Colors.white }}>
                    <Card.Content>
                        <Text variant='titleMedium' style={{ marginBottom: 8 }}>
                            {isEndOfOverChange ? "Select next over bowler" : "Change bowler and continue this over"}
                        </Text>
                        <Dropdown
                            label='Select Bowler'
                            mode='outlined'
                            value={selectedBowlerId}
                            options={options}
                            onSelect={(value) => setSelectedBowlerId(value ?? "")}
                        />
                        <Button mode='contained' style={{ borderRadius: 8, marginTop: 16 }} onPress={onContinue} disabled={!selectedBowlerId}>
                            Continue
                        </Button>
                    </Card.Content>
                </Card>
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: Spacing.defaultSpace,
        gap: Spacing.defaultSpace,
    },
});
