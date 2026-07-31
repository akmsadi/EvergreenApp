import React, { useEffect, useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { Button, SegmentedButtons, TextInput } from "react-native-paper";
import { DatePickerInput } from "react-native-paper-dates";
import { Dropdown } from "react-native-paper-dropdown";

import { Colors } from "@/constants/colors";
import { Spacing } from "@/constants/spacing";
import { MatchModel } from "@/database/models/MatchModel";
import VenueRepository from "@/database/repositories/VenueRepository";
import SyncService from "@/services/SyncService";
import { formatDatabaseDate } from "@/utils/Common";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type MatchEditorProps = {
    initialMatch?: MatchModel | null;
    onSave: (match: MatchModel) => void;
    onAddPlayers?: (matchId: number) => void;
};

export default function MatchEditor({ initialMatch, onSave, onAddPlayers }: MatchEditorProps) {
    const insets = useSafeAreaInsets();
    const [matchType, setMatchType] = useState("t20");
    const [overs, setOvers] = useState("20");
    const [teamName, setTeamName] = useState("");
    const [opponentName, setOpponentName] = useState("");
    const [notes, setNotes] = useState("");
    const [scheduledAt, setScheduledAt] = useState(new Date());
    const [venueId, setVenueId] = useState<number>();
    const [venueList, setVenueList] = useState<{ label: string; value: string }[]>([]);

    const [oversError, setOversError] = useState("");
    const [teamNameError, setTeamNameError] = useState("");
    const [opponentNameError, setOpponentNameError] = useState("");
    const [venueError, setVenueError] = useState("");

    useEffect(() => {
        loadVenues();
    }, []);

    useEffect(() => {
        if (!initialMatch) {
            return;
        }

        setMatchType(initialMatch.match_type);
        setOvers(String(initialMatch.format_overs));

        setTeamName(initialMatch.team_name);
        setOpponentName(initialMatch.opponent_name);

        setNotes(initialMatch.notes ?? "");

        setVenueId(initialMatch.venue_id ?? undefined);

        if (initialMatch.scheduled_at) {
            setScheduledAt(new Date(initialMatch.scheduled_at));
        }
    }, [initialMatch]);

    const selectedVenue = useMemo(() => {
        return VenueRepository.getAll().find((v) => v.id === venueId);
    }, [venueId]);

    const loadVenues = () => {
        setVenueList(
            VenueRepository.getAll().map((v) => ({
                label: v.name,
                value: String(v.id),
            })),
        );
    };

    const handleSave = () => {
        setOversError("");
        setTeamNameError("");
        setOpponentNameError("");
        setVenueError("");

        let hasError = false;

        const trimmedTeamName = teamName.trim();
        const trimmedOpponentName = opponentName.trim();
        const oversNumber = Number(overs);

        if (!trimmedTeamName) {
            setTeamNameError("Team name is required.");
            hasError = true;
        }

        if (!trimmedOpponentName) {
            setOpponentNameError("Opponent name is required.");
            hasError = true;
        }

        if (!overs.trim()) {
            setOversError("Overs is required.");
            hasError = true;
        } else if (isNaN(oversNumber) || oversNumber <= 0) {
            setOversError("Enter a valid number of overs.");
            hasError = true;
        }

        if (venueId == null) {
            setVenueError("Please select a venue.");
            hasError = true;
        }

        if (hasError) {
            return;
        }

        const now = new Date().toISOString();

        const match: MatchModel = {
            id: initialMatch?.id ?? Date.now(),
            server_id: initialMatch?.server_id ?? null,

            match_type: matchType,
            format_overs: oversNumber,

            venue: selectedVenue?.name ?? null,
            venue_id: venueId ?? null,

            scheduled_at: formatDatabaseDate(scheduledAt),

            team_name: trimmedTeamName,
            opponent_name: trimmedOpponentName,

            toss_winner: initialMatch?.toss_winner ?? null,
            toss_decision: initialMatch?.toss_decision ?? null,

            match_status: initialMatch?.match_status ?? "scheduled",

            result_type: initialMatch?.result_type ?? null,
            result_summary: initialMatch?.result_summary ?? null,

            notes: notes.trim() || null,

            created_at: initialMatch?.created_at ?? now,
            updated_at: now,
            deleted_at: initialMatch?.deleted_at ?? null,

            from_admin: initialMatch?.from_admin ?? 0,
            synced_at: initialMatch?.synced_at ?? null,

            dirty: 1,
        };

        onSave(match);
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1, backgroundColor: Colors.background }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps='handled'>
                <SegmentedButtons
                    value={matchType}
                    onValueChange={setMatchType}
                    buttons={[
                        { value: "t20", label: "T20", style: { borderRadius: 8 } },
                        { value: "odi", label: "Custom", style: { borderRadius: 8 } },
                    ]}
                    theme={{
                        colors: {
                            secondaryContainer: Colors.primary,
                            onSecondaryContainer: Colors.white,
                        },
                    }}
                />

                <TextInput
                    label='Overs'
                    mode='outlined'
                    keyboardType='numeric'
                    value={overs}
                    onChangeText={(text) => {
                        setOvers(text);
                        if (oversError) setOversError("");
                    }}
                    error={!!oversError}
                />

                <TextInput
                    label='Team Name'
                    mode='outlined'
                    value={teamName}
                    onChangeText={(text) => {
                        setTeamName(text);
                        if (teamNameError) setTeamNameError("");
                    }}
                    error={!!teamNameError}
                />

                <TextInput
                    label='Opponent Name'
                    mode='outlined'
                    value={opponentName}
                    onChangeText={(text) => {
                        setOpponentName(text);
                        if (opponentNameError) setOpponentNameError("");
                    }}
                    error={!!opponentNameError}
                />

                <View style={styles.venueRow}>
                    <View style={styles.venueDropdown}>
                        <Dropdown
                            label='Venue'
                            mode='outlined'
                            value={venueId !== undefined ? String(venueId) : undefined}
                            onSelect={(value) => {
                                setVenueId(value ? Number(value) : undefined);

                                if (venueError) {
                                    setVenueError("");
                                }
                            }}
                            options={venueList}
                            error={!!venueError}
                        />
                    </View>
                </View>

                <DatePickerInput
                    locale='en-GB'
                    label='Match Date'
                    value={scheduledAt}
                    onChange={(date) => {
                        if (date) {
                            setScheduledAt(date);
                        }
                    }}
                    inputMode='start'
                    mode='outlined'
                />

                <TextInput label='Notes' mode='outlined' multiline numberOfLines={4} value={notes} onChangeText={setNotes} />

                <View style={styles.syncButtonContainer}>
                    <Button
                        mode='outlined'
                        icon='sync'
                        style={{ borderRadius: 8 }}
                        onPress={async () => {
                            await SyncService.syncVenues();
                            loadVenues();
                        }}
                    >
                        Sync Venues
                    </Button>
                </View>
            </ScrollView>
            <View
                style={[
                    styles.bottomButtons,
                    {
                        paddingBottom: Math.max(insets.bottom, Spacing.defaultSpace),
                    },
                ]}
            >
                {initialMatch && onAddPlayers && (
                    <View style={styles.buttonWrapper}>
                        <Button
                            mode='contained-tonal'
                            icon='account-multiple-plus'
                            style={{ borderRadius: 8 }}
                            onPress={() => {
                                if (initialMatch && onAddPlayers) {
                                    onAddPlayers(initialMatch.id);
                                }
                            }}
                        >
                            Add Players
                        </Button>
                    </View>
                )}

                <View style={styles.buttonWrapper}>
                    <Button mode='contained' icon='content-save' onPress={handleSave} style={{ borderRadius: 8 }}>
                        Save
                    </Button>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: Spacing.defaultSpace,
        gap: Spacing.defaultSpace,
    },

    venueRow: {
        flexDirection: "row",
        alignItems: "center",
    },

    venueDropdown: {
        flex: 1,
    },

    dateGroup: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },

    dateInput: {
        flex: 1,
    },

    sideButton: {
        borderRadius: 8,
        justifyContent: "center",
    },

    sideButtonContent: {
        height: 56,
        paddingHorizontal: 16,
    },

    bottomButtons: {
        flexDirection: "row",
        gap: 12,
        marginTop: "auto",
        padding: Spacing.defaultSpace,
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: Colors.darkGray,
    },

    buttonWrapper: {
        flex: 1,
    },

    syncButtonContainer: {
        marginTop: 8,
    },
});
