import AuthService from "@/services/AuthService";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router, Tabs } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function TabLayout() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkLogin();
    }, []);

    async function checkLogin() {
        const loggedIn = await AuthService.isLoggedIn();
        if (!loggedIn) {
            router.replace("/login");
            return;
        }
        setLoading(false);
    }

    if (loading) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <ActivityIndicator size='large' />
            </View>
        );
    }

    return (
        <Tabs screenOptions={{ headerShown: false }}>
            <Tabs.Screen
                name='dashboard'
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name='home' color={color} size={size} />,
                }}
            />

            <Tabs.Screen
                name='matches'
                options={{
                    title: "Matches",
                    tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name='cricket' color={color} size={size} />,
                }}
            />

            <Tabs.Screen
                name='players'
                options={{
                    title: "Players",
                    tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name='account-group' color={color} size={size} />,
                }}
            />
        </Tabs>
    );
}
