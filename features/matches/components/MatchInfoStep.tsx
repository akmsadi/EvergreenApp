import { View } from "react-native";
import { TextInput } from "react-native-paper";

import AppButton from "../../../components/AppButton";

import { useMatchSetupStore } from "../../../stores/matchSetupStore";

export default function MatchInfoStep() {
    const {
        matchName,

        setMatchName,

        next,
    } = useMatchSetupStore();

    return (
        <View style={{ padding: 16 }}>
            <TextInput label='Match Name' mode='outlined' value={matchName} onChangeText={setMatchName} />

            <AppButton title='Next' onPress={next} />
        </View>
    );
}
