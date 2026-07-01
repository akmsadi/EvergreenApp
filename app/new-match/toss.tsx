import { router } from "expo-router";
import { View } from "react-native";
import { Button, Text } from "react-native-paper";

export default function Toss() {
    return (
        <View
            style={{
                flex: 1,
                padding: 20,
            }}
        >
            <Text variant='headlineMedium'>Toss</Text>

            <Button mode='outlined' style={{ marginTop: 20 }}>
                Team A won Toss
            </Button>

            <Button mode='outlined' style={{ marginTop: 10 }}>
                Team B won Toss
            </Button>

            <Button mode='contained' style={{ marginTop: 40 }} onPress={() => router.push("/new-match/playing11")}>
                Continue
            </Button>
        </View>
    );
}
