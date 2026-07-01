import { router } from "expo-router";
import { ScrollView } from "react-native";
import { Card, Text } from "react-native-paper";
import { useMatchStore } from "../../stores/matchStore";

export default function MatchType() {
    const setFormat = useMatchStore((state) => state.setFormat);

    const formats = [
        { name: "T10", overs: 10 },

        { name: "T20", overs: 20 },

        { name: "ODI", overs: 50 },

        { name: "TEST", overs: 90 },
    ];

    return (
        <ScrollView contentContainerStyle={{ padding: 20 }}>
            <Text variant='headlineMedium' style={{ marginBottom: 20 }}>
                Match Format
            </Text>

            {formats.map((item) => (
                <Card
                    key={item.name}
                    style={{ marginBottom: 15 }}
                    onPress={() => {
                        setFormat(item.name as any, item.overs);

                        router.push("/new-match/teams");
                    }}
                >
                    <Card.Title title={item.name} subtitle={`${item.overs} Overs`} />
                </Card>
            ))}
        </ScrollView>
    );
}
