import { View } from "react-native";

import { Text } from "react-native-paper";

export default function EmptyTeams() {
    return (
        <View
            style={{
                padding: 40,
                alignItems: "center",
            }}
        >
            <Text variant='headlineSmall'>No Teams Found</Text>

            <Text>Tap + to create your first team.</Text>
        </View>
    );
}
