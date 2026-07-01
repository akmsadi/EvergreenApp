import { router } from "expo-router";
import { View } from "react-native";
import { Button, Text } from "react-native-paper";
import { useMatchStore } from "../../stores/matchStore";

export default function Teams() {
    const match = useMatchStore((state) => state.match);

    return (
        <View
            style={{
                flex: 1,
                padding: 20,
            }}
        >
            <Text variant='headlineMedium'>Team Selection</Text>

            <Button mode='outlined' style={{ marginTop: 20 }}>
                Select Team A
            </Button>

            <Button mode='outlined' style={{ marginTop: 15 }}>
                Select Team B
            </Button>

            <Button mode='contained' style={{ marginTop: 40 }} onPress={() => router.push("/new-match/toss")}>
                Continue
            </Button>

            <Text variant='titleMedium'>{match.format}</Text>

            <Text>{match.overs} Overs</Text>
        </View>
    );
}
