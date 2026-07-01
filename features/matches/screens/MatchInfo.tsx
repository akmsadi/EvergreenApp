import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { TextInput } from "react-native-paper";
import AppButton from "../../../components/AppButton";

export default function MatchInfo() {
    const [name, setName] = useState("");

    return (
        <View style={{ padding: 16 }}>
            <TextInput label='Match Name' mode='outlined' value={name} onChangeText={setName} />

            <AppButton title='Next' onPress={() => router.push("/new-match/team-a")} />
        </View>
    );
}
