import { Colors } from "@/constants/colors";
import { Spacing } from "@/constants/spacing";
import { MatchModel } from "@/database/models/MatchModel";
import MatchPlayerRepository from "@/database/repositories/MatchPlayerRepository";
import MatchRepository from "@/database/repositories/MatchRepository";
import ScoreEngine from "@/features/scoring/engine/ScoreEngine";
import { formatDate } from "@/utils/Common";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

export default function MatchCard({ match, onDelete }: { match: MatchModel; onDelete: (id: number) => void }) {
    const router = useRouter();
    const handleStartMatch = async (matchId: number) => {
        try {
            const resumed = await ScoreEngine.resumeMatch(matchId);
            if (resumed) {
                router.push("/scoring");
                return;
            }
            router.push(`/matches/${matchId}/start`);
        } catch (error) {
            Alert.alert("Unable to start", error instanceof Error ? error.message : "Unknown error");
        }
    };

    const handleCopy = (id: number) => {
        const source = MatchRepository.find(id);
        if (!source) {
            return;
        }

        const now = new Date().toISOString();
        const newMatch: MatchModel = {
            ...source,
            id: Date.now(),
            toss_winner: null,
            toss_decision: null,
            match_status: "scheduled",
            result_type: null,
            result_summary: null,
            created_at: now,
            updated_at: now,
            deleted_at: null,
            from_admin: 0,
            synced_at: null,
            dirty: 1,
        };
        MatchRepository.save(newMatch);
        const players = MatchPlayerRepository.getByMatch(id);
        const teamAIds = players.filter((p) => p.team === "team_a").map((p) => p.player_id);
        const teamBIds = players.filter((p) => p.team === "team_b").map((p) => p.player_id);
        const teamACaptain = players.find((p) => p.team === "team_a" && p.is_captain === 1)?.player_id ?? null;
        const teamBCaptain = players.find((p) => p.team === "team_b" && p.is_captain === 1)?.player_id ?? null;
        MatchPlayerRepository.saveAssignments(newMatch.id, teamAIds, teamBIds, teamACaptain, teamBCaptain);
        router.push(`/matches/${newMatch.id}/edit`);
    };

    return (
        <View key={match.id} style={styles.matchCard}>
            <View style={styles.cardHeader}>
                <Text style={{ fontSize: 12 }}>{formatDate(match.scheduled_at)}</Text>
                <View
                    style={[
                        styles.statusBadge,
                        {
                            backgroundColor: match.match_status === "scheduled" ? "#E53935" : "#43A047",
                        },
                    ]}
                >
                    <Text style={styles.statusText}>{match.match_status.toUpperCase()}</Text>
                </View>
            </View>
            <View style={styles.teamRow}>
                <View style={styles.teamBlock}>
                    <Text numberOfLines={2} style={styles.teamName}>
                        {match.team_name}
                    </Text>
                </View>
                <View style={styles.vsCircle}>
                    <Text style={styles.vsText}>VS</Text>
                </View>
                <View style={styles.teamBlock}>
                    <Text numberOfLines={2} style={styles.teamName}>
                        {match.opponent_name}
                    </Text>
                </View>
            </View>
            <View style={styles.infoRow}>
                <View style={styles.infoColumn}>
                    <Text style={styles.matchSubTitle}>
                        {match.match_type.toUpperCase()} • {match.format_overs} Overs
                    </Text>
                </View>

                <View style={styles.infoColumn}>
                    <Text style={styles.venue}>{match.venue || "TBA"}</Text>
                </View>
            </View>
            <View style={styles.actionRow}>
                {match.match_status === "scheduled" && (
                    <>
                        <View style={styles.actionItem}>
                            <Button
                                mode='text'
                                icon='pencil'
                                contentStyle={styles.buttonContent}
                                style={styles.fullButton}
                                onPress={() => router.push(`/matches/${match.id}/edit`)}
                            >
                                Edit
                            </Button>
                        </View>
                        <View style={styles.verticalDivider} />
                        <View style={styles.actionItem}>
                            <Button
                                mode='text'
                                icon='delete'
                                textColor='#D32F2F'
                                contentStyle={styles.buttonContent}
                                style={styles.fullButton}
                                onPress={() => onDelete(match.id)}
                            >
                                Delete
                            </Button>
                        </View>
                        <View style={styles.verticalDivider} />
                        <View style={styles.actionItem}>
                            <Button
                                mode='text'
                                icon='play'
                                contentStyle={styles.buttonContent}
                                style={styles.fullButton}
                                onPress={() => handleStartMatch(match.id)}
                            >
                                Start
                            </Button>
                        </View>
                    </>
                )}
                {!!match.result_summary && (
                    <>
                        <View style={styles.actionItem}>
                            <Button
                                mode='text'
                                icon='text-box-outline'
                                contentStyle={styles.buttonContent}
                                style={styles.fullButton}
                                onPress={() => router.push(`/matches/${match.id}/summary`)}
                            >
                                Summary
                            </Button>
                        </View>
                        <View style={styles.verticalDivider} />
                        <View style={styles.actionItem}>
                            <Button
                                mode='text'
                                icon='content-copy'
                                contentStyle={styles.buttonContent}
                                style={styles.fullButton}
                                onPress={() => handleCopy(match.id)}
                            >
                                Copy
                            </Button>
                        </View>
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: Spacing.defaultSpace,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray,
    },

    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 6,
    },

    statusText: {
        color: "#FFF",
        fontSize: 10,
        fontWeight: "700",
    },

    matchCard: {
        backgroundColor: Colors.white,
        borderRadius: 8,
        elevation: 8,
    },

    teamRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        paddingVertical: Spacing.defaultSpace,
    },

    teamBlock: {
        alignItems: "center",
        flex: 1,
    },

    teamName: {
        textAlign: "center",
        fontSize: 14,
        paddingHorizontal: Spacing.defaultSpace,
    },

    vsCircle: {
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 8,
    },

    vsText: {
        fontWeight: "700",
        fontSize: 14,
    },

    divider: {
        height: 1,
        backgroundColor: Colors.darkGray,
    },

    actionRow: {
        flexDirection: "row",
        alignItems: "stretch",
        borderTopWidth: 1,
        borderColor: Colors.gray,
    },

    actionItem: {
        flex: 1,
    },

    verticalDivider: {
        width: 1,
        backgroundColor: Colors.gray,
    },

    fullButton: {
        borderRadius: 0,
        margin: 0,
    },

    buttonContent: {
        height: 45,
    },

    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        padding: Spacing.defaultSpace,
    },

    infoColumn: {
        flex: 1,
    },

    matchSubTitle: {
        fontSize: 11,
    },

    venue: {
        fontSize: 11,
        textAlign: "right",
    },
});
