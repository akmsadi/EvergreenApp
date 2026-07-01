/*import { router } from "expo-router";
import { View } from "react-native";
import { Button, Card, Text } from "react-native-paper";

export default function NewMatch() {
    return (
        <View style={{ flex: 1, padding: 20 }}>
            <Card>
                <Card.Content>
                    <Text variant='headlineMedium'>Create New Match</Text>

                    <Text variant='bodyMedium' style={{ marginTop: 10 }}>
                        Follow the steps to create a match.
                    </Text>

                    <Button mode='contained' style={{ marginTop: 30 }} onPress={() => router.push("/new-match/match-type")}>
                        Start
                    </Button>
                </Card.Content>
            </Card>
        </View>
    );
}*/

export { default } from "../../features/matches/screens/MatchWizard";
