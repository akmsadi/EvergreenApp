import { View } from "react-native";
import { Text } from "react-native-paper";

interface Props {
    title: string;
    subtitle: string;
}

export default function EmptyState({ title, subtitle }: Props) {
    return (
        <View
            style={{
                padding: 40,
                alignItems: "center",
            }}
        >
            <Text variant='headlineSmall'>{title}</Text>

            <Text>{subtitle}</Text>
        </View>
    );
}
