import AppHeader from "@/components/AppHeader";
import PlayerEditor from "@/components/PlayerEditor";
import PlayerRepository from "@/database/repositories/PlayerRepository";
import { useRouter } from "expo-router";
import { View } from "react-native";

export default function AddPlayerScreen() {
    const router = useRouter();

    return (
        <View style={{ flex: 1 }}>
            <AppHeader showBack />

            <PlayerEditor
                onSave={(player) => {
                    PlayerRepository.insertAppPlayer(player);
                    router.back();
                }}
            />
        </View>
    );
}
