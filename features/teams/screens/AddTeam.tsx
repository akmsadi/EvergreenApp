import { useState } from "react";

import { View } from "react-native";

import { Button, TextInput } from "react-native-paper";

import { router } from "expo-router";

import { useTeamStore } from "../../../stores/teamStore";

export default function AddTeam() {
    const addTeam = useTeamStore((state) => state.addTeam);

    const [name, setName] = useState("");

    const [shortName, setShortName] = useState("");

    function save() {
        addTeam({
            name,

            shortName,
        });

        router.back();
    }

    return (
        <View
            style={{
                padding: 20,
            }}
        >
            <TextInput label='Team Name' value={name} onChangeText={setName} mode='outlined' />

            <TextInput
                label='Short Name'
                value={shortName}
                onChangeText={setShortName}
                mode='outlined'
                style={{
                    marginTop: 15,
                }}
            />

            <Button
                mode='contained'
                style={{
                    marginTop: 25,
                }}
                onPress={save}
            >
                Save
            </Button>
        </View>
    );
}
