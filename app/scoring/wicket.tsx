import AppHeader from "@/components/AppHeader";
import AppSelect from "@/components/AppSelect";

import MatchPlayerRepository from "@/database/repositories/MatchPlayerRepository";
import PlayerRepository from "@/database/repositories/PlayerRepository";

import ScoreEngine from "@/features/scoring/engine/ScoreEngine";
import DeliveryRepository from "@/features/scoring/repositories/DeliveryRepository";
import InningsRepository from "@/features/scoring/repositories/InningsRepository";
import { DismissalType } from "@/features/scoring/types/DismissalType";

import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Button, Card, Text } from "react-native-paper";

interface PlayerItem {
    id: string;
    name: string;
}

export default function WicketScreen() {
    const router = useRouter();

    const [players, setPlayers] = useState<PlayerItem[]>([]);
    const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
    const [dismissedPlayers, setDismissedPlayers] = useState<PlayerItem[]>([]);
    const [fielderPlayers, setFielderPlayers] = useState<PlayerItem[]>([]);
    const [selectedDismissedPlayerId, setSelectedDismissedPlayerId] = useState<string>("");
    const [selectedDismissalType, setSelectedDismissalType] = useState<string>(DismissalType.BOWLED);
    const [selectedFielderId, setSelectedFielderId] = useState<string>("");
    const [dismissedBatsmanName, setDismissedBatsmanName] = useState("Unknown");
    const [dismissalLabel, setDismissalLabel] = useState("Wicket");
    const [dismissalDetail, setDismissalDetail] = useState("");
    const [bowlerName, setBowlerName] = useState<string | undefined>();
    const [fielderName, setFielderName] = useState<string | undefined>();

    const loadScreen = useCallback(async () => {
        const scoreboard = await ScoreEngine.getScoreboard();
        const innings = InningsRepository.find(scoreboard.inningsId);
        const lastDelivery = DeliveryRepository.findLast(scoreboard.inningsId);

        if (!innings) {
            return;
        }

        if (lastDelivery) {
            const dismissedPlayerId = lastDelivery.dismissed_player_id ?? lastDelivery.batsman_id;
            const dismissedPlayer = PlayerRepository.find(dismissedPlayerId);
            const bowler = PlayerRepository.find(lastDelivery.bowler_id);
            const fielder = lastDelivery.fielder_id ? PlayerRepository.find(lastDelivery.fielder_id) : null;

            setBowlerName(bowler?.name);
            setFielderName(fielder?.name);

            setDismissedBatsmanName(dismissedPlayer?.name ?? "Unknown");
            setDismissalLabel(formatDismissal(lastDelivery.dismissal_type));
            setDismissalDetail(buildDismissalDetail(lastDelivery.dismissal_type, bowler?.name, fielder?.name));
            setSelectedDismissedPlayerId(String(dismissedPlayerId));
            setSelectedDismissalType(lastDelivery.dismissal_type ?? DismissalType.BOWLED);
            setSelectedFielderId(fielder ? String(fielder.id) : "");
        }

        const striker = PlayerRepository.find(scoreboard.strikerId);
        const nonStriker = PlayerRepository.find(scoreboard.nonStrikerId);

        setDismissedPlayers(
            [striker ? { id: striker.id, name: striker.name } : null, nonStriker ? { id: nonStriker.id, name: nonStriker.name } : null].filter(
                Boolean,
            ) as PlayerItem[],
        );

        const bowlingTeamPlayers = MatchPlayerRepository.getTeamPlayers(innings.match_id, innings.bowling_team);

        const fielderList: PlayerItem[] = [];

        for (const playerId of bowlingTeamPlayers) {
            const player = PlayerRepository.find(playerId);

            if (!player) {
                continue;
            }

            fielderList.push({
                id: player.id,
                name: player.name,
            });
        }

        setFielderPlayers(fielderList);

        const matchPlayers = MatchPlayerRepository.getRemainingBatsmen(innings.match_id, innings.batting_team, scoreboard.inningsId);

        const list: PlayerItem[] = [];

        for (const mp of matchPlayers) {
            const player = PlayerRepository.find(mp.player_id);

            if (!player) {
                continue;
            }

            list.push({
                id: player.id,

                name: player.name,
            });
        }

        setPlayers(list);
    }, []);

    useEffect(() => {
        void loadScreen();
    }, [loadScreen]);

    function formatDismissal(dismissalType?: string | null) {
        if (!dismissalType) {
            return "Wicket";
        }

        return dismissalType
            .replaceAll("_", " ")
            .toLowerCase()
            .replace(/(^|\s)\S/g, (char) => char.toUpperCase());
    }

    function buildDismissalDetail(dismissalType?: string | null, bowlerName?: string, fielderName?: string) {
        switch (dismissalType) {
            case DismissalType.BOWLED:
                return bowlerName ? `b ${bowlerName}` : "Bowled";
            case DismissalType.CAUGHT:
                if (bowlerName && fielderName && bowlerName === fielderName) {
                    return `C & B ${bowlerName}`;
                }

                if (fielderName && bowlerName) {
                    return `c ${fielderName} b ${bowlerName}`;
                }

                return "Caught";
            case DismissalType.LBW:
                return bowlerName ? `lbw b ${bowlerName}` : "Lbw";
            case DismissalType.RUN_OUT:
                return fielderName ? `run out (${fielderName})` : "Run Out";
            case DismissalType.STUMPED:
                if (fielderName && bowlerName) {
                    return `st ${fielderName} b ${bowlerName}`;
                }

                return "Stumped";
            case DismissalType.RETIRED_HURT:
                return "Retired Hurt";
            default:
                return "";
        }
    }

    function requiresFielder(dismissalType?: string | null) {
        return dismissalType === DismissalType.CAUGHT || dismissalType === DismissalType.RUN_OUT || dismissalType === DismissalType.STUMPED;
    }

    function onDismissedPlayerChange(value: string) {
        setSelectedDismissedPlayerId(value);

        const selectedPlayer = dismissedPlayers.find((player) => String(player.id) === value);

        setDismissedBatsmanName(selectedPlayer?.name ?? "Unknown");
    }

    function onDismissalTypeChange(value: string) {
        setSelectedDismissalType(value);
        setDismissalLabel(formatDismissal(value));

        if (!requiresFielder(value)) {
            setSelectedFielderId("");
            setFielderName(undefined);
            setDismissalDetail(buildDismissalDetail(value, bowlerName, undefined));
            return;
        }

        setDismissalDetail(buildDismissalDetail(value, bowlerName, fielderName));
    }

    function onFielderChange(value: string) {
        setSelectedFielderId(value);

        const selectedPlayer = fielderPlayers.find((player) => String(player.id) === value);
        const nextFielderName = selectedPlayer?.name;

        setFielderName(nextFielderName);
        setDismissalDetail(buildDismissalDetail(selectedDismissalType, bowlerName, nextFielderName));
    }

    async function onContinue() {
        if (!selectedPlayerId || !selectedDismissedPlayerId || !selectedDismissalType) {
            return;
        }

        await ScoreEngine.resolveWicket(selectedPlayerId, selectedDismissedPlayerId, selectedDismissalType as DismissalType, selectedFielderId || undefined);

        if (ScoreEngine.isEndOfOver()) {
            router.replace("/scoring/bowler");
            return;
        }

        router.back();
    }

    return (
        <>
            <AppHeader title='New Batsman' showBack />

            <ScrollView contentContainerStyle={styles.container}>
                <Card>
                    <Card.Content>
                        <Text variant='titleMedium' style={styles.sectionTitle}>
                            Dismissed Batsman
                        </Text>

                        <AppSelect
                            label='Who got out?'
                            value={dismissedPlayers.find((player) => String(player.id) === selectedDismissedPlayerId)?.name ?? ""}
                            options={dismissedPlayers.map((player) => ({
                                label: player.name,
                                value: String(player.id),
                            }))}
                            onChange={onDismissedPlayerChange}
                        />

                        <Text style={styles.metaText}>{dismissalLabel}</Text>
                    </Card.Content>
                </Card>

                <Card>
                    <Card.Content>
                        <Text variant='titleMedium' style={styles.sectionTitle}>
                            How Got Out
                        </Text>

                        <Text style={styles.metaText}>Bowler: {bowlerName ?? "Unknown"}</Text>

                        <AppSelect
                            label='Dismissal Type'
                            value={formatDismissal(selectedDismissalType)}
                            options={[
                                { label: "Please select", value: "" },
                                { label: "Bowled", value: DismissalType.BOWLED },
                                { label: "Caught", value: DismissalType.CAUGHT },
                                { label: "Run Out", value: DismissalType.RUN_OUT },
                                { label: "Stumped", value: DismissalType.STUMPED },
                                { label: "Retired Hurt", value: DismissalType.RETIRED_HURT },
                                { label: "Hit Wicket", value: DismissalType.HIT_WICKET },
                                { label: "Lbw", value: DismissalType.LBW },
                            ]}
                            onChange={onDismissalTypeChange}
                        />

                        {requiresFielder(selectedDismissalType) ? (
                            <AppSelect
                                label='Fielder'
                                value={fielderPlayers.find((player) => String(player.id) === selectedFielderId)?.name ?? ""}
                                options={fielderPlayers.map((player) => ({
                                    label: player.name,
                                    value: String(player.id),
                                }))}
                                onChange={onFielderChange}
                            />
                        ) : null}
                    </Card.Content>
                </Card>

                <Card>
                    <Card.Content>
                        <Text variant='titleMedium' style={styles.sectionTitle}>
                            Incoming Batsman
                        </Text>

                        <AppSelect
                            label='Select Batsman'
                            value={players.find((player) => String(player.id) === selectedPlayerId)?.name ?? ""}
                            options={players.map((player) => ({
                                label: player.name,
                                value: String(player.id),
                            }))}
                            onChange={setSelectedPlayerId}
                        />
                    </Card.Content>
                </Card>

                <Card>
                    <Card.Content>
                        <Text variant='titleMedium' style={styles.sectionTitle}>
                            Wicket Details
                        </Text>

                        <Text>{dismissedBatsmanName}</Text>
                        <Text style={styles.metaText}>{dismissalLabel}</Text>
                        {dismissalDetail ? <Text style={styles.metaText}>{dismissalDetail}</Text> : null}
                    </Card.Content>
                </Card>

                <Button
                    mode='contained'
                    onPress={onContinue}
                    disabled={!selectedPlayerId || !selectedDismissedPlayerId || !selectedDismissalType}
                    style={styles.button}
                >
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

    sectionTitle: {
        marginBottom: 8,
    },

    metaText: {
        marginTop: 4,
        opacity: 0.7,
    },

    button: {
        marginTop: 8,
    },
});
