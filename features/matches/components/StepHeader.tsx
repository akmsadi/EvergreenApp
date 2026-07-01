import { View } from "react-native";
import { ProgressBar, Text } from "react-native-paper";

interface Props {
    step: number;

    title: string;
}

export default function StepHeader({
    step,

    title,
}: Props) {
    return (
        <View
            style={{
                padding: 16,
            }}
        >
            <Text variant='headlineSmall'>{title}</Text>

            <ProgressBar
                progress={step / 7}
                style={{
                    marginTop: 12,
                }}
            />
        </View>
    );
}
