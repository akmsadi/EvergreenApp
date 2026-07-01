import { useState } from "react";
import { Alert, ScrollView } from "react-native";
import { Switch, Text, TextInput } from "react-native-paper";

import AppButton from "../../../components/AppButton";
import SelectField from "../../../components/SelectField";
import { battingStyles, bowlingStyles } from "../../../constants/playerOptions";
import { Player } from "../types";

interface Props {
    initialValues?: Partial<Player>;
    onSubmit: (player: Omit<Player, "id">) => void;
}

export default function PlayerForm({ initialValues, onSubmit }: Props) {
    const [firstName, setFirstName] = useState(initialValues?.firstName ?? "");
    const [lastName, setLastName] = useState(initialValues?.lastName ?? "");

    const [jerseyNumber, setJerseyNumber] = useState(initialValues?.jerseyNumber?.toString() ?? "");

    const [battingPosition, setBattingPosition] = useState(initialValues?.battingPosition?.toString() ?? "");

    const [isCaptain, setCaptain] = useState(initialValues?.isCaptain ?? false);

    const [isKeeper, setKeeper] = useState(initialValues?.isWicketKeeper ?? false);

    const [battingStyle, setBattingStyle] = useState(initialValues?.battingStyle ?? "Right Hand Bat");

    const [bowlingStyle, setBowlingStyle] = useState(initialValues?.bowlingStyle ?? "None");

    function save() {
        if (!firstName.trim()) {
            Alert.alert("Validation", "First name is required.");
            return;
        }

        if (!lastName.trim()) {
            Alert.alert("Validation", "Last name is required.");
            return;
        }

        const jersey = Number(jerseyNumber);

        if (Number.isNaN(jersey) || jersey < 0) {
            Alert.alert("Validation", "Enter a valid jersey number.");
            return;
        }

        const position = Number(battingPosition);

        if (Number.isNaN(position) || position < 1 || position > 11) {
            Alert.alert("Validation", "Batting position must be between 1 and 11.");
            return;
        }

        onSubmit({
            teamId: initialValues?.teamId ?? 0,

            firstName: firstName.trim(),

            lastName: lastName.trim(),

            jerseyNumber: jersey,

            battingStyle,

            bowlingStyle,

            battingPosition: position,

            isCaptain,

            isWicketKeeper: isKeeper,
        });
    }

    return (
        <ScrollView
            contentContainerStyle={{
                padding: 16,
            }}
        >
            <TextInput label='First Name' value={firstName} onChangeText={setFirstName} mode='outlined' />

            <TextInput label='Last Name' value={lastName} onChangeText={setLastName} mode='outlined' style={{ marginTop: 12 }} />

            <TextInput
                label='Jersey Number'
                keyboardType='numeric'
                value={jerseyNumber}
                onChangeText={setJerseyNumber}
                mode='outlined'
                style={{ marginTop: 12 }}
            />

            <SelectField
                label='Batting Style'
                value={battingStyle}
                options={battingStyles.map((style) => ({
                    label: style,
                    value: style,
                }))}
                onChange={(value) => setBattingStyle(value as typeof battingStyle)}
            />

            <SelectField
                label='Bowling Style'
                value={bowlingStyle}
                options={bowlingStyles.map((style) => ({
                    label: style,
                    value: style,
                }))}
                onChange={(value) => setBowlingStyle(value as typeof bowlingStyle)}
            />

            <TextInput
                label='Batting Position'
                keyboardType='numeric'
                value={battingPosition}
                onChangeText={setBattingPosition}
                mode='outlined'
                style={{ marginTop: 12 }}
            />

            <Text style={{ marginTop: 20 }}>Captain</Text>

            <Switch value={isCaptain} onValueChange={setCaptain} />

            <Text style={{ marginTop: 20 }}>Wicket Keeper</Text>

            <Switch value={isKeeper} onValueChange={setKeeper} />

            <AppButton title='Save Player' onPress={save} />
        </ScrollView>
    );
}
