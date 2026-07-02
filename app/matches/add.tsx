import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from "react-native";
import { Button, SegmentedButtons, TextInput } from "react-native-paper";

import AppHeader from "@/components/AppHeader";
import { Spacing } from "@/constants/spacing";
import { MatchModel } from "@/database/models/MatchModel";
import MatchRepository from "@/database/repositories/MatchRepository";

export default function AddMatch() {
    const router = useRouter();
    const [matchType, setMatchType] = useState("t20");
    const [overs, setOvers] = useState("20");
    const [teamName, setTeamName] = useState("");
    const [opponentName, setOpponentName] = useState("");
    const [venue, setVenue] = useState("");
    const [scheduledAt, setScheduledAt] = useState("");
    const [notes, setNotes] = useState("");

    const save = () => {
        const now = new Date().toISOString();

        const match: MatchModel = {
            id: Date.now(), // Temporary local ID

            match_type: matchType,
            format_overs: Number(overs),

            venue: venue || null,
            venue_id: null,

            scheduled_at: scheduledAt || null,

            team_name: teamName.trim(),
            opponent_name: opponentName.trim(),

            toss_winner: null,
            toss_decision: null,

            match_status: "scheduled",

            result_type: null,
            result_summary: null,

            notes: notes || null,

            created_at: now,
            updated_at: now,
            deleted_at: null,

            synced_at: null,

            dirty: 1,
        };

        MatchRepository.save(match);

        router.back();
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <AppHeader title='New Match' showBack />
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
                <TextInput label='Venue' mode='outlined' value={venue} onChangeText={setVenue} />
                <TextInput label='Match Date' mode='outlined' placeholder='YYYY-MM-DD HH:mm' value={scheduledAt} onChangeText={setScheduledAt} />
                <TextInput label='Notes' mode='outlined' multiline numberOfLines={4} value={notes} onChangeText={setNotes} />
                <Button mode='contained' onPress={save}>
                    Save Match
                </Button>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: Spacing.defaultSpace,
        gap: Spacing.defaultSpace,
    },
});
