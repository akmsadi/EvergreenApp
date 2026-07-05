import { migrateDatabase } from "@/database/migrations";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { PaperProvider } from "react-native-paper";
import { enGB, registerTranslation } from "react-native-paper-dates";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { theme } from "../theme";

registerTranslation("en-GB", enGB);

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    useEffect(() => {
        async function prepareApp() {
            try {
                migrateDatabase();
                await new Promise((resolve) => setTimeout(resolve, 2000));
            } catch (error) {
                console.warn("SplashScreen error:", error);
            } finally {
                await SplashScreen.hideAsync();
            }
        }

        prepareApp();
    }, []);

    return (
        <SafeAreaProvider>
            <PaperProvider theme={theme}>
                <Stack screenOptions={{ headerShown: false }} />
            </PaperProvider>
        </SafeAreaProvider>
    );
}
