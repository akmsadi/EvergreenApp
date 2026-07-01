import { View } from "react-native";
import { useMatchSetupStore } from "../../../stores/matchSetupStore";

import MatchInfoStep from "../components/MatchInfoStep";
import PlayingXIStep from "../components/PlayingXIStep";
import TeamSelectionStep from "../components/TeamSelectionStep";

export default function MatchWizard() {
    const step = useMatchSetupStore((s) => s.step);

    return (
        <View
            style={{
                flex: 1,
            }}
        >
            {step === 1 && <MatchInfoStep />}

            {step === 2 && <TeamSelectionStep />}

            {step === 3 && <PlayingXIStep team='A' />}

            {step === 4 && <PlayingXIStep team='B' />}
        </View>
    );
}
