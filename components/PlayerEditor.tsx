import React, { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { Button, SegmentedButtons, TextInput } from "react-native-paper";
import { Dropdown } from "react-native-paper-dropdown";

import { Colors } from "@/constants/colors";
import { Spacing } from "@/constants/spacing";

import { PlayerModel } from "@/database/models/PlayerModel";
import PlayerRepository from "@/database/repositories/PlayerRepository";

type PlayerEditorProps = {
    initialPlayer?: PlayerModel | null;
    onSave: (player: PlayerModel) => void;
    onDelete?: (playerId: string) => void;
};

export default function PlayerEditor({ initialPlayer, onSave, onDelete }: PlayerEditorProps) {
    const [name, setName] = useState("");
    const [organization, setOrganization] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [status, setStatus] = useState("approved");
    const [guestOfPlayerId, setGuestOfPlayerId] = useState<string | undefined>();
    const [playerList, setPlayerList] = useState<
        {
            label: string;
            value: string;
        }[]
    >([]);

    useEffect(() => {
        loadPlayers();
    }, []);

    useEffect(() => {
        if (!initialPlayer) {
            return;
        }

        setName(initialPlayer.name);
        setOrganization(initialPlayer.organization ?? "");
        setPhone(initialPlayer.phone ?? "");
        setEmail(initialPlayer.email ?? "");
        setAddress(initialPlayer.address ?? "");
        setStatus(initialPlayer.status);
        setGuestOfPlayerId(initialPlayer.guest_of_player_id ? String(initialPlayer.guest_of_player_id) : undefined);
    }, [initialPlayer]);

    function loadPlayers() {
        const players = PlayerRepository.getAll()
            .filter((player) => player.status === "approved")
            .map((player) => ({
                label: player.name,
                value: String(player.id),
            }));

        setPlayerList(players);
    }

    function handleSave() {
        const trimmedName = name.trim();

        if (!trimmedName) {
            alert("Player name is required.");
            return;
        }

        const now = new Date().toISOString();
        const player: PlayerModel = {
            id: initialPlayer?.id ?? "",
            server_id: initialPlayer?.server_id ?? null,
            name: trimmedName,
            organization: organization.trim() || null,
            phone: phone.trim() || null,
            email: email.trim() || null,
            address: address.trim() || null,
            guest_of_player_id: status === "guest" && guestOfPlayerId ? guestOfPlayerId : null,
            status,
            total_contribution: initialPlayer?.total_contribution ?? 0,
            total_expense: initialPlayer?.total_expense ?? 0,
            created_at: initialPlayer?.created_at ?? now,
            updated_at: now,
        };
        onSave(player);
    }

    function handleDelete() {
        if (initialPlayer) {
            onDelete?.(initialPlayer.id);
        }
    }

    return (
        <KeyboardAvoidingView
            style={{
                flex: 1,
                backgroundColor: Colors.background,
            }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps='handled'>
                <TextInput style={styles.input} label='Player Name' mode='outlined' value={name} onChangeText={setName} />

                <TextInput label='Organization' mode='outlined' value={organization} onChangeText={setOrganization} />

                <TextInput label='Phone' mode='outlined' keyboardType='phone-pad' value={phone} onChangeText={setPhone} />

                <TextInput label='Email' mode='outlined' keyboardType='email-address' autoCapitalize='none' value={email} onChangeText={setEmail} />

                <TextInput label='Address' mode='outlined' multiline numberOfLines={3} value={address} onChangeText={setAddress} />

                <SegmentedButtons
                    style={styles.segmented}
                    value={status}
                    onValueChange={setStatus}
                    buttons={[
                        {
                            value: "approved",
                            label: "Approved",
                        },
                        {
                            value: "guest",
                            label: "Guest",
                        },
                        {
                            value: "external",
                            label: "External",
                        },
                    ]}
                />

                {status === "guest" && (
                    <Dropdown label='Guest Of Player' mode='outlined' value={guestOfPlayerId} onSelect={setGuestOfPlayerId} options={playerList} />
                )}
            </ScrollView>

            <View style={styles.bottomButtons}>
                <View style={styles.buttonWrapper}>
                    <Button mode='contained' icon='content-save' style={styles.button} onPress={handleSave}>
                        Save Player
                    </Button>
                </View>
                {initialPlayer && (
                    <View style={styles.buttonWrapper}>
                        <Button mode='contained' icon='delete' style={styles.button} onPress={handleDelete}>
                            Delete Player
                        </Button>
                    </View>
                )}
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: Spacing.defaultSpace,
        gap: Spacing.defaultSpace,
        paddingBottom: 120,
    },

    segmented: {
        marginBottom: 4,
    },

    input: {
        backgroundColor: Colors.white,
    },

    bottomButtons: {
        flexDirection: "row",
        gap: 12,
        marginTop: "auto",
        padding: Spacing.defaultSpace,
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
    },

    buttonWrapper: {
        flex: 1,
    },

    button: {
        borderRadius: 8,
    },
});
