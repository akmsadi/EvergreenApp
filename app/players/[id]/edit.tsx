import AppHeader from "@/components/AppHeader";
import PlayerEditor from "@/components/PlayerEditor";
import PlayerRepository from "@/database/repositories/PlayerRepository";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View } from "react-native";

export default function EditPlayerScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const player = PlayerRepository.find(String(id));

    return (
        <View style={{ flex: 1 }}>
            <AppHeader showBack />

            <PlayerEditor
                initialPlayer={player}
                onSave={(player) => {
                    PlayerRepository.update(player);
                    router.back();
                }}
                onDelete={(playerId) => {
                    PlayerRepository.delete(playerId);
                    router.back();
                }}
            />
        </View>
    );
}
