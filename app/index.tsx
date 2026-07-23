import { Colors } from "@/constants/colors";
import { Spacing } from "@/constants/spacing";
import { UserModel } from "@/database/models/UserModel";
import UserRepository from "@/database/repositories/UserRepository";
import ApiService from "@/services/ApiService";
import SecureStorage from "@/services/SecureStorage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Image, ImageBackground, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Card, Text, TextInput } from "react-native-paper";

export default function Index() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [usernameError, setUsernameError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [checkingLogin, setCheckingLogin] = useState(true);

    useEffect(() => {
        checkLogin();
    }, []);

    const checkLogin = async () => {
        try {
            const token = await SecureStorage.getToken();

            if (token) {
                router.replace("/(tabs)/dashboard");
                return;
            }
        } catch (error) {
            console.error(error);
        } finally {
            setCheckingLogin(false);
        }
    };

    const handleLogin = async () => {
        const trimmedUsername = username.trim();

        // Clear previous errors
        setUsernameError("");
        setPasswordError("");

        let hasError = false;

        if (!trimmedUsername) {
            setUsernameError("Username is required.");
            hasError = true;
        }

        if (!password) {
            setPasswordError("Password is required.");
            hasError = true;
        }

        if (hasError) return;

        try {
            const user = await ApiService.login<UserModel>(trimmedUsername, password);

            await SecureStorage.setToken(user.token);
            UserRepository.save(user);

            router.replace("/(tabs)/dashboard");
        } catch (error) {
            Alert.alert("Login Failed", error instanceof Error ? error.message : "An error occurred while logging in.");
        }
    };

    if (checkingLogin) {
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
        <ImageBackground source={require("@/assets/images/background-stadium.webp")} style={styles.background} resizeMode='cover'>
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    padding: Spacing.defaultSpace,
                }}
            >
                <Image
                    source={require("@/assets/images/logo-evergreen.webp")}
                    style={{
                        width: "80%",
                        height: 100,
                        alignSelf: "center",
                    }}
                    resizeMode='contain'
                />
                <Card style={styles.card}>
                    <Card.Content>
                        <Text variant='headlineSmall' style={{ textAlign: "center", marginBottom: Spacing.defaultSpace, color: Colors.white }}>
                            Login
                        </Text>
                        <TextInput
                            label='Username'
                            style={styles.input}
                            value={username}
                            onChangeText={(text) => {
                                setUsername(text);
                                if (usernameError) setUsernameError("");
                            }}
                            mode='flat'
                            error={!!usernameError}
                            textColor={Colors.white}
                            theme={{
                                colors: {
                                    onSurfaceVariant: Colors.darkGray,
                                    error: "#ff6262",
                                },
                            }}
                        />

                        <TextInput
                            label='Password'
                            style={styles.input}
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                if (passwordError) setPasswordError("");
                            }}
                            mode='flat'
                            secureTextEntry
                            error={!!passwordError}
                            textColor={Colors.white}
                            theme={{
                                colors: {
                                    onSurfaceVariant: Colors.darkGray,
                                    error: "#ff6262",
                                },
                            }}
                        />
                        <Button
                            mode='contained'
                            onPress={handleLogin}
                            icon='login'
                            style={styles.submitButton}
                            contentStyle={{ height: 54 }}
                            labelStyle={styles.submitButtonLabel}
                        >
                            Login
                        </Button>
                    </Card.Content>
                </Card>
            </View>
        </ImageBackground>
    );
}
const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: "100%",
    },
    card: {
        backgroundColor: "rgba(0,0,0,0.65)",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.3)",
    },
    input: {
        backgroundColor: "rgba(255,255,255,0.08)",
        marginBottom: 12,
        color: Colors.white,
    },
    submitButton: {
        marginTop: 4,
        borderRadius: 12,
        elevation: 5, // Android
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    submitButtonLabel: {
        fontSize: 16,
        fontWeight: "700",
        letterSpacing: 1,
        textTransform: "uppercase",
    },
});
