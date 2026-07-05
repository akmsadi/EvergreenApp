import React, { useEffect, useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { Button, SegmentedButtons, TextInput } from "react-native-paper";
import { DatePickerModal } from "react-native-paper-dates";
import { Dropdown } from "react-native-paper-dropdown";

import { Spacing } from "@/constants/spacing";
import { MatchModel } from "@/database/models/MatchModel";
import VenueRepository from "@/database/repositories/VenueRepository";
import SyncService from "@/services/SyncService";
import { formatDatabaseDate, formatDisplayDate } from "@/utils/Common";

type MatchEditorProps = {
    initialMatch?: MatchModel | null;
    onSave: (match: MatchModel) => void;
    onAddPlayers?: (matchId: number) => void;
};

export default function MatchEditor({ initialMatch, onSave, onAddPlayers }: MatchEditorProps) {
    const [matchType, setMatchType] = useState("t20");
    const [overs, setOvers] = useState("20");
    const [teamName, setTeamName] = useState("");
    const [opponentName, setOpponentName] = useState("");
    const [notes, setNotes] = useState("");

    const [scheduledAt, setScheduledAt] = useState(new Date());
    const [openDatePicker, setOpenDatePicker] = useState(false);

    const [venueId, setVenueId] = useState<number>();

    const [venueList, setVenueList] = useState<{ label: string; value: string }[]>([]);

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
    }, [venueId, venueList]);

    const loadVenues = () => {
        setVenueList(
            VenueRepository.getAll().map((v) => ({
                label: v.name,
                value: String(v.id),
            })),
        );
    };

    const syncVenues = async () => {
        await SyncService.syncVenues();
        loadVenues();
    };

    const handleSave = () => {
        const now = new Date().toISOString();

        const match: MatchModel = {
            id: initialMatch?.id ?? Date.now(),

            match_type: matchType,
            format_overs: Number(overs),

            venue: selectedVenue?.name ?? null,
            venue_id: venueId ?? null,

            scheduled_at: formatDatabaseDate(scheduledAt),

            team_name: teamName.trim(),
            opponent_name: opponentName.trim(),

            toss_winner: initialMatch?.toss_winner ?? null,
            toss_decision: initialMatch?.toss_decision ?? null,

            match_status: initialMatch?.match_status ?? "scheduled",

            result_type: initialMatch?.result_type ?? null,
            result_summary: initialMatch?.result_summary ?? null,

            notes: notes || null,

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
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps='handled'>
                <SegmentedButtons
                    value={matchType}
                    onValueChange={setMatchType}
                    buttons={[
                        { value: "t20", label: "T20" },
                        { value: "odi", label: "ODI" },
                        { value: "test", label: "Test" },
                    ]}
                />

                <TextInput label='Overs' mode='outlined' keyboardType='numeric' value={overs} onChangeText={setOvers} />

                <TextInput label='Team Name' mode='outlined' value={teamName} onChangeText={setTeamName} />

                <TextInput label='Opponent Name' mode='outlined' value={opponentName} onChangeText={setOpponentName} />

                <View style={styles.venueRow}>
                    <View style={styles.venueDropdown}>
                        <Dropdown
                            label='Venue'
                            mode='outlined'
                            value={venueId !== undefined ? String(venueId) : undefined}
                            onSelect={(value) => setVenueId(value ? Number(value) : undefined)}
                            options={venueList}
                        />
                    </View>

                    <Button mode='contained' icon='sync' onPress={syncVenues} style={styles.sideButton} contentStyle={styles.sideButtonContent}>
                        Sync
                    </Button>
                </View>

                <View style={styles.dateGroup}>
                    <TextInput mode='outlined' label='Match Date' value={formatDisplayDate(scheduledAt)} editable={false} style={styles.dateInput} />

                    <Button
                        mode='contained'
                        icon='calendar'
                        onPress={() => setOpenDatePicker(true)}
                        style={styles.sideButton}
                        contentStyle={styles.sideButtonContent}
                    >
                        Pick
                    </Button>
                </View>

                <TextInput label='Notes' mode='outlined' multiline numberOfLines={4} value={notes} onChangeText={setNotes} />

                <View style={styles.bottomButtons}>
                    <View style={styles.buttonWrapper}>
                        <Button
                            mode='contained-tonal'
                            icon='account-multiple-plus'
                            onPress={() => {
                                if (initialMatch && onAddPlayers) {
                                    onAddPlayers(initialMatch.id);
                                }
                            }}
                        >
                            Add Players
                        </Button>
                    </View>

                    <View style={styles.buttonWrapper}>
                        <Button mode='contained' icon='content-save' onPress={handleSave}>
                            Save
                        </Button>
                    </View>
                </View>
            </ScrollView>

            <DatePickerModal
                locale='en-GB'
                mode='single'
                visible={openDatePicker}
                date={scheduledAt}
                onDismiss={() => setOpenDatePicker(false)}
                onConfirm={({ date }) => {
                    setOpenDatePicker(false);

                    if (date) {
                        setScheduledAt(date);
                    }
                }}
            />
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
        marginRight: 8,
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
        marginTop: 12,
    },

    buttonWrapper: {
        flex: 1,
    },
});
