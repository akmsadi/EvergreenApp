import AppSplash from "@/components/AppSplash";
import AppToast from "@/components/AppToast";
import { migrateDatabase } from "@/database/migrations";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { ImageBackground } from "react-native";
import { PaperProvider } from "react-native-paper";
import { enGB, registerTranslation } from "react-native-paper-dates";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { theme } from "../theme";

registerTranslation("en-GB", enGB);

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        async function prepareApp() {
            try {
                await migrateDatabase();

                // Hide native splash immediately
                await SplashScreen.hideAsync();

                // Keep custom splash visible for 2 seconds
                await new Promise((resolve) => setTimeout(resolve, 2000));

                setReady(true);
            } catch (error) {
                console.warn(error);
            }
        }

        prepareApp();
    }, []);

    if (!ready) {
        return <AppSplash />;
    }

    return (
        <SafeAreaProvider>
            <PaperProvider theme={theme}>
                <ImageBackground source={require("@/assets/images/background-stadium.webp")} style={{ flex: 1 }} resizeMode='cover'>
                    <Stack
                        screenOptions={{
                            headerShown: false,
                            contentStyle: {
                                backgroundColor: "transparent",
                            },
                        }}
                    />
                    <AppToast />
                </ImageBackground>
            </PaperProvider>
        </SafeAreaProvider>
    );
}
