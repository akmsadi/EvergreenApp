import AppHeader from "@/components/AppHeader";
import { Colors } from "@/constants/colors";
import { Spacing } from "@/constants/spacing";
import { PlayerModel } from "@/database/models/PlayerModel";
import MatchPlayerRepository from "@/database/repositories/MatchPlayerRepository";
import MatchRepository from "@/database/repositories/MatchRepository";
import PlayerRepository from "@/database/repositories/PlayerRepository";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, IconButton, SegmentedButtons, Text, TextInput } from "react-native-paper";
import { Dropdown } from "react-native-paper-dropdown";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TeamKey = "teamA" | "teamB";

type TeamSelectionPanelProps = {
    title: string;
    count: number;
    players: PlayerModel[];
    selectedIds: string[];
    hiddenPlayerIds: string[];
    onToggle: (playerId: string) => void;
};

export default function MatchPlayersScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { id } = useLocalSearchParams<{ id?: string }>();

    const [players, setPlayers] = useState<PlayerModel[]>([]);
    const [teamAIds, setTeamAIds] = useState<string[]>([]);
    const [teamBIds, setTeamBIds] = useState<string[]>([]);
    const [teamACaptain, setTeamACaptain] = useState<string>();
    const [teamBCaptain, setTeamBCaptain] = useState<string>();
    const [activeTeam, setActiveTeam] = useState<TeamKey>("teamA");

    const match = id ? MatchRepository.find(Number(id)) : null;
    const teamATitle = match?.team_name || "Team 1";
    const teamBTitle = match?.opponent_name || "Team 2";

    useEffect(() => {
        setPlayers(PlayerRepository.getAll());

        if (id) {
            const matchId = Number(id);
            const savedTeamA = MatchPlayerRepository.getTeamPlayers(matchId, "team_a");
            const savedTeamB = MatchPlayerRepository.getTeamPlayers(matchId, "team_b");
            const savedCaptainA = MatchPlayerRepository.getCaptain(matchId, "team_a");
            const savedCaptainB = MatchPlayerRepository.getCaptain(matchId, "team_b");

            setTeamAIds(savedTeamA);
            setTeamBIds(savedTeamB);
            setTeamACaptain(savedCaptainA !== null ? String(savedCaptainA) : undefined);
            setTeamBCaptain(savedCaptainB !== null ? String(savedCaptainB) : undefined);
        }
    }, [id]);

    const teamAOptions = useMemo(
        () => players.filter((player) => teamAIds.includes(player.id)).map((player) => ({ label: player.name, value: String(player.id) })),
        [players, teamAIds],
    );

    const teamBOptions = useMemo(
        () => players.filter((player) => teamBIds.includes(player.id)).map((player) => ({ label: player.name, value: String(player.id) })),
        [players, teamBIds],
    );

    useEffect(() => {
        if (teamACaptain && !teamAOptions.some((option) => option.value === teamACaptain)) {
            setTeamACaptain(undefined);
        }
    }, [teamACaptain, teamAOptions]);

    useEffect(() => {
        if (teamBCaptain && !teamBOptions.some((option) => option.value === teamBCaptain)) {
            setTeamBCaptain(undefined);
        }
    }, [teamBCaptain, teamBOptions]);

    const toggleSelection = (team: TeamKey, playerId: string) => {
        if (team === "teamA") {
            setTeamAIds((current) => {
                if (current.includes(playerId)) {
                    return current.filter((id) => id !== playerId);
                }

                return [...current, playerId];
            });
            setTeamBIds((current) => current.filter((id) => id !== playerId));
            return;
        }

        setTeamBIds((current) => {
            if (current.includes(playerId)) {
                return current.filter((id) => id !== playerId);
            }

            return [...current, playerId];
        });
        setTeamAIds((current) => current.filter((id) => id !== playerId));
    };

    const handleSave = () => {
        if (!id) {
            router.replace("/(tabs)/dashboard");
            return;
        }

        const matchId = Number(id);
        MatchPlayerRepository.saveAssignments(matchId, teamAIds, teamBIds, teamACaptain ?? null, teamBCaptain ?? null);
        router.replace("/(tabs)/dashboard");
    };

    return (
        <View style={styles.container}>
            <AppHeader title='Match Players' showBack />

            <View style={styles.content}>
                <View style={styles.contentContainer}>
                    <SegmentedButtons
                        value={activeTeam}
                        onValueChange={(value) => setActiveTeam(value as TeamKey)}
                        buttons={[
                            { value: "teamA", label: teamATitle },
                            { value: "teamB", label: teamBTitle },
                        ]}
                    />

                    {activeTeam === "teamA" ? (
                        <View style={styles.contentBody}>
                            <TeamSelectionPanel
                                title={teamATitle}
                                count={teamAIds.length}
                                players={players}
                                selectedIds={teamAIds}
                                hiddenPlayerIds={teamBIds}
                                onToggle={(playerId) => toggleSelection("teamA", playerId)}
                            />

                            <View style={styles.captainSection}>
                                <Dropdown
                                    label={`${teamATitle} captain`}
                                    mode='outlined'
                                    value={teamACaptain}
                                    options={teamAOptions}
                                    onSelect={(value) => setTeamACaptain(value ?? undefined)}
                                />
                            </View>
                        </View>
                    ) : (
                        <View style={styles.contentBody}>
                            <TeamSelectionPanel
                                title={teamBTitle}
                                count={teamBIds.length}
                                players={players}
                                selectedIds={teamBIds}
                                hiddenPlayerIds={teamAIds}
                                onToggle={(playerId) => toggleSelection("teamB", playerId)}
                            />

                            <View style={styles.captainSection}>
                                <Dropdown
                                    label={`${teamBTitle} captain`}
                                    mode='outlined'
                                    value={teamBCaptain}
                                    options={teamBOptions}
                                    onSelect={(value) => setTeamBCaptain(value ?? undefined)}
                                />
                            </View>
                        </View>
                    )}
                </View>

                <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Spacing.defaultSpace) }]}>
                    <Button mode='contained' onPress={handleSave} style={{ borderRadius: 8 }}>
                        Save
                    </Button>
                </View>
            </View>
        </View>
    );
}

function TeamSelectionPanel({ title, count, players, selectedIds, hiddenPlayerIds, onToggle }: TeamSelectionPanelProps) {
    const [query, setQuery] = useState("");

    const handleToggle = (playerId: string) => {
        onToggle(playerId);
        setQuery("");
    };

    const filteredPlayers = players.filter((player) => {
        if (hiddenPlayerIds.includes(player.id)) {
            return false;
        }

        const searchText = query.trim().toLowerCase();
        if (!searchText) {
            return true;
        }

        return [player.name, player.organization ?? ""].some((value) => value.toLowerCase().includes(searchText));
    });

    return (
        <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
                <Text variant='titleMedium'>{title}</Text>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{count} selected</Text>
                </View>
            </View>

            <TextInput mode='outlined' placeholder={`Search ${title} players`} value={query} onChangeText={setQuery} dense style={styles.searchInput} />

            <ScrollView style={styles.playerList} contentContainerStyle={styles.playerListContent} nestedScrollEnabled>
                {filteredPlayers.length === 0 ? (
                    <Text style={styles.emptyText}>No players match your search.</Text>
                ) : (
                    filteredPlayers.map((player) => {
                        const checked = selectedIds.includes(player.id);

                        return (
                            <View key={player.id} style={styles.playerRow}>
                                <IconButton
                                    icon={checked ? "checkbox-marked" : "checkbox-blank-outline"}
                                    size={24}
                                    onPress={() => handleToggle(player.id)}
                                    iconColor={checked ? Colors.primary : Colors.border}
                                    style={styles.checkboxWrapper}
                                    accessibilityLabel={`Select ${player.name}`}
                                />

                                <View style={styles.playerInfo}>
                                    <View style={styles.playerNameRow}>
                                        <Text style={styles.playerName} onPress={() => handleToggle(player.id)}>
                                            {player.name}
                                        </Text>
                                        {player.organization && <Text style={styles.playerMeta}>• {player.organization}</Text>}
                                    </View>
                                </View>
                            </View>
                        );
                    })
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },

    content: {
        flex: 1,
    },

    contentContainer: {
        flex: 1,
        padding: Spacing.defaultSpace,
        gap: Spacing.defaultSpace,
    },

    contentBody: {
        flex: 1,
        gap: 8,
    },

    matchupHeader: {
        alignItems: "center",
        justifyContent: "center",
    },

    matchupTitle: {
        fontSize: 18,
    },

    helperText: {
        color: Colors.textSecondary,
    },

    sectionCard: {
        flex: 1,
        backgroundColor: Colors.white,
        borderRadius: 16,
        gap: 5,
    },

    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    badge: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
    },

    badgeText: {
        color: Colors.white,
        fontSize: 12,
        fontWeight: "600",
    },

    searchInput: {
        marginBottom: 8,
        fontSize: 14,
        backgroundColor: Colors.white,
    },

    playerList: {
        flex: 1,
        borderWidth: 1,
        borderColor: Colors.darkGray,
        borderRadius: 8,
        padding: 2,
    },

    playerListContent: {
        paddingVertical: 4,
    },

    playerRow: {
        flexDirection: "row",
        alignItems: "center",
    },

    checkboxWrapper: {
        marginRight: 4,
        padding: 0,
        margin: 0,
    },

    playerInfo: {
        flex: 1,
    },

    playerNameRow: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 6,
    },

    playerName: {
        // fontWeight: "600",
    },

    playerMeta: {
        color: Colors.textSecondary,
        fontSize: 12,
    },

    emptyText: {
        color: Colors.textSecondary,
        padding: 0,
    },

    captainSection: {
        gap: Spacing.defaultSpace,
    },

    footer: {
        marginTop: "auto",
        padding: Spacing.defaultSpace,
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: Colors.darkGray,
    },
});
