import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs } from "expo-router";

export default function TabLayout() {
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
