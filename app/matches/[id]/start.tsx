import AppHeader from "@/components/AppHeader";

import MatchPlayerRepository from "@/database/repositories/MatchPlayerRepository";
import MatchRepository from "@/database/repositories/MatchRepository";
import PlayerRepository from "@/database/repositories/PlayerRepository";

import ScoreEngine from "@/features/scoring/engine/ScoreEngine";

import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Button, Card, Divider, RadioButton, Text } from "react-native-paper";

export default function StartMatchScreen() {
    const router = useRouter();

    const { id } = useLocalSearchParams();

    const matchId = Number(id);

    const [match, setMatch] = useState<any>();

    const [teamAPlayers, setTeamAPlayers] = useState<any[]>([]);
    const [teamBPlayers, setTeamBPlayers] = useState<any[]>([]);

    const [tossWinner, setTossWinner] = useState<"team_a" | "team_b">("team_a");

    const [decision, setDecision] = useState<"bat" | "bowl">("bat");

    const [strikerId, setStrikerId] = useState<number>();

    const [nonStrikerId, setNonStrikerId] = useState<number>();

    const [bowlerId, setBowlerId] = useState<number>();

    useEffect(() => {
        load();
    }, []);

    function load() {
        const m = MatchRepository.find(matchId);

        setMatch(m);

        const a = MatchPlayerRepository.getTeamPlayers(matchId, "team_a");

        const b = MatchPlayerRepository.getTeamPlayers(matchId, "team_b");

        setTeamAPlayers(
            a
                .map((id) => PlayerRepository.find(id))

                .filter(Boolean),
        );

        setTeamBPlayers(
            b
                .map((id) => PlayerRepository.find(id))

                .filter(Boolean),
        );
    }

    const battingPlayers = useMemo(() => {
        const battingTeam = decision === "bat" ? tossWinner : tossWinner === "team_a" ? "team_b" : "team_a";

        return battingTeam === "team_a" ? teamAPlayers : teamBPlayers;
    }, [decision, tossWinner, teamAPlayers, teamBPlayers]);

    const bowlingPlayers = useMemo(() => {
        const bowlingTeam = decision === "bat" ? (tossWinner === "team_a" ? "team_b" : "team_a") : tossWinner;

        return bowlingTeam === "team_a" ? teamAPlayers : teamBPlayers;
    }, [decision, tossWinner, teamAPlayers, teamBPlayers]);

    async function start() {
        if (!strikerId || !nonStrikerId || !bowlerId) {
            alert("Select opening players.");

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

            params: {
                inningsId,
            },
        });
    }

    return (
        <>
            <AppHeader title='Start Match' />

            <ScrollView contentContainerStyle={styles.container}>
                <Card>
                    <Card.Title title='Toss' />

                    <Card.Content>
                        <Text>Toss Winner</Text>

                        <RadioButton.Group value={tossWinner} onValueChange={(v) => setTossWinner(v as any)}>
                            <RadioButton.Item label={match?.team_name ?? "Team A"} value='team_a' />

                            <RadioButton.Item label={match?.opponent_name ?? "Team B"} value='team_b' />
                        </RadioButton.Group>

                        <Divider />

                        <Text>Decision</Text>

                        <RadioButton.Group value={decision} onValueChange={(v) => setDecision(v as any)}>
                            <RadioButton.Item label='Bat' value='bat' />

                            <RadioButton.Item label='Bowl' value='bowl' />
                        </RadioButton.Group>
                    </Card.Content>
                </Card>
                <Card>
                    <Card.Title title='Opening Batsman' />

                    <Card.Content>
                        <RadioButton.Group value={String(strikerId)} onValueChange={(v) => setStrikerId(Number(v))}>
                            {battingPlayers.map((player) => (
                                <RadioButton.Item key={player.id} label={player.name} value={String(player.id)} />
                            ))}
                        </RadioButton.Group>
                    </Card.Content>
                </Card>
                <Card>
                    <Card.Title title='Non Striker' />

                    <Card.Content>
                        <RadioButton.Group value={String(nonStrikerId)} onValueChange={(v) => setNonStrikerId(Number(v))}>
                            {battingPlayers

                                .filter((p) => p.id !== strikerId)

                                .map((player) => (
                                    <RadioButton.Item key={player.id} label={player.name} value={String(player.id)} />
                                ))}
                        </RadioButton.Group>
                    </Card.Content>
                </Card>
                <Card>
                    <Card.Title title='Opening Bowler' />

                    <Card.Content>
                        <RadioButton.Group value={String(bowlerId)} onValueChange={(v) => setBowlerId(Number(v))}>
                            {bowlingPlayers.map((player) => (
                                <RadioButton.Item key={player.id} label={player.name} value={String(player.id)} />
                            ))}
                        </RadioButton.Group>
                    </Card.Content>
                </Card>

                <Button mode='contained' onPress={start}>
                    Start Match
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
});
