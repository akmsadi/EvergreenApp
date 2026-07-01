import { router } from "expo-router";
import { View } from "react-native";
import { Button, Card, Text, TextInput } from "react-native-paper";

export default function Login() {
    return (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                padding: 20,
            }}
        >
            <Card>
                <Card.Content>
                    <Text variant='headlineMedium'>Evergreen Scorer</Text>

                    <TextInput label='Username' mode='outlined' style={{ marginTop: 20 }} />

                    <TextInput label='Password' mode='outlined' secureTextEntry style={{ marginTop: 10 }} />

                    <Button mode='contained' onPress={() => router.replace("/(tabs)/dashboard")}>
                        Login
                    </Button>
                </Card.Content>
            </Card>
        </View>
    );
}
