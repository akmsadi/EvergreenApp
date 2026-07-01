import { router } from "expo-router";
import { View } from "react-native";
import { Button, Text } from "react-native-paper";

export default function Playing11() {
    return (
        <View
            style={{
                flex: 1,
                padding: 20,
            }}
        >
            <Text variant='headlineMedium'>Select Playing XI</Text>

            <Button mode='contained' style={{ marginTop: 40 }} onPress={() => router.push("/new-match/scoring")}>
                Start Match
            </Button>
        </View>
    );
}
