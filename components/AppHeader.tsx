import { Colors } from "@/constants/colors";
import SecureStorage from "@/services/SecureStorage";
import { useRouter } from "expo-router";
import * as React from "react";
import { Alert, Image, Platform, StyleSheet, View } from "react-native";
import { Appbar } from "react-native-paper";

export default function AppHeader({ showBack }: { showBack?: boolean | string }) {
    const router = useRouter();

    const handleLogout = async () => {
        Alert.alert("Logout", "Are you sure you want to logout?", [
            {
                text: "Cancel",
                style: "cancel",
            },
            {
                text: "Logout",
                onPress: async () => {
                    await SecureStorage.removeToken();

                    router.replace("/");
                },
            },
        ]);
    };

    return (
        <View style={styles.safeArea}>
            <Appbar.Header style={styles.header}>
                {showBack ? (
                    <Appbar.BackAction
                        color={Colors.white}
                        onPress={() => {
                            if (typeof showBack === "string") {
                                router.replace(showBack as any);
                            } else {
                                router.back();
                            }
                        }}
                    />
                ) : (
                    <Appbar.Action icon='menu' color={Colors.darkGray} onPress={() => {}} />
                )}

                <View style={styles.logoContainer}>
                    <Image source={require("@/assets/images/logo-evergreen.webp")} style={styles.logo} resizeMode='contain' />
                </View>

                <Appbar.Action icon='logout' color={Colors.darkGray} onPress={handleLogout} />
            </Appbar.Header>
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: Colors.primary,
    },

    header: {
        backgroundColor: Colors.primary,
        height: Platform.OS === "ios" ? 70 : 60,
        paddingHorizontal: 0,

        // Android shadow
        elevation: 4,

        // iOS shadow (bottom)
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.12,
        shadowRadius: 2,
    },

    logoContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },

    logo: {
        width: 120,
        height: 40,
    },
});
