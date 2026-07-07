import AppHeader from "@/components/AppHeader";
import AppSelect from "@/components/AppSelect";
import MatchPlayerRepository from "@/database/repositories/MatchPlayerRepository";
import PlayerRepository from "@/database/repositories/PlayerRepository";
import ScoreEngine from "@/features/scoring/engine/ScoreEngine";
import InningsRepository from "@/features/scoring/repositories/InningsRepository";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Button, Card, Text } from "react-native-paper";

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

        await ScoreEngine.changeBowler(Number(selectedBowlerId));
        router.back();
    }

    return (
        <>
            <AppHeader title='Change Bowler' showBack />

            <ScrollView contentContainerStyle={styles.container}>
                <Card>
                    <Card.Content>
                        <Text style={styles.helperText}>{isEndOfOverChange ? "Select next over bowler" : "Change bowler and continue this over"}</Text>

                        <AppSelect
                            label='Select Bowler'
                            value={options.find((option) => option.value === selectedBowlerId)?.label ?? ""}
                            options={options}
                            onChange={setSelectedBowlerId}
                        />
                    </Card.Content>
                </Card>

                <Button mode='contained' onPress={onContinue} disabled={!selectedBowlerId}>
                    Continue
                </Button>
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        gap: 16,
    },

    helperText: {
        marginBottom: 8,
        opacity: 0.7,
    },
});
