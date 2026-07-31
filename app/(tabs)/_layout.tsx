import { Colors } from "@/constants/colors";
import AuthService from "@/services/AuthService";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router, Tabs } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkLogin();
    }, []);

    async function checkLogin() {
        const loggedIn = await AuthService.isLoggedIn();
        if (!loggedIn) {
            router.replace("/");
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
        <Tabs
            screenOptions={{
                headerShown: false,

                tabBarActiveTintColor: "transparent",
                tabBarInactiveTintColor: "transparent",

                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: "600",
                    marginBottom: 4,
                },

                tabBarIconStyle: {
                    marginTop: 4,
                },

                tabBarStyle: {
                    backgroundColor: Colors.white,
                    borderTopColor: "transparent",
                    height: 60 + insets.bottom,
                    paddingTop: 8,
                    paddingBottom: insets.bottom,

                    // Android shadow
                    elevation: 8,

                    // iOS shadow
                    shadowColor: "#000",
                    shadowOffset: {
                        width: 0,
                        height: -2,
                    },
                    shadowOpacity: 0.15,
                    shadowRadius: 4,
                },

                tabBarHideOnKeyboard: true,
            }}
        >
            <Tabs.Screen
                name='dashboard'
                options={{
                    title: "Home",

                    tabBarIcon: ({ focused }) => <FontAwesome name='home' size={24} color={focused ? Colors.secondary : Colors.dark} />,

                    tabBarLabel: ({ focused }) => (
                        <Text
                            style={{
                                color: focused ? Colors.secondary : Colors.dark,
                                fontSize: 12,
                                fontWeight: "600",
                            }}
                        >
                            Home
                        </Text>
                    ),
                }}
            />

            <Tabs.Screen
                name='matches'
                options={{
                    title: "Matches",

                    tabBarIcon: ({ size, focused }) => (
                        <MaterialCommunityIcons name={focused ? "cricket" : "cricket"} size={24} color={focused ? Colors.secondary : Colors.dark} />
                    ),

                    tabBarLabel: ({ focused }) => (
                        <Text
                            style={{
                                color: focused ? Colors.secondary : Colors.dark,
                                fontSize: 12,
                                fontWeight: "600",
                            }}
                        >
                            Matches
                        </Text>
                    ),
                }}
            />

            <Tabs.Screen
                name='players'
                options={{
                    title: "Players",

                    tabBarIcon: ({ size, focused }) => (
                        <MaterialCommunityIcons name={focused ? "account-group" : "account-group"} size={24} color={focused ? Colors.secondary : Colors.dark} />
                    ),

                    tabBarLabel: ({ focused }) => (
                        <Text
                            style={{
                                color: focused ? Colors.secondary : Colors.dark,
                                fontSize: 12,
                                fontWeight: "600",
                            }}
                        >
                            Players
                        </Text>
                    ),
                }}
            />
        </Tabs>
    );
}
