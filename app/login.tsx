import { Colors } from "@/constants/colors";
import { Spacing } from "@/constants/spacing";
import { UserModel } from "@/database/models/UserModel";
import UserRepository from "@/database/repositories/UserRepository";
import ApiService from "@/services/ApiService";
import SecureStorage from "@/services/SecureStorage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ImageBackground, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Card, Text, TextInput } from "react-native-paper";

export default function Login() {
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
        <ImageBackground source={require("@/assets/images/icon.png")} style={styles.background} imageStyle={styles.backgroundImage} resizeMode='cover'>
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    padding: Spacing.defaultSpace,
                }}
            >
                <Card style={styles.card}>
                    <Card.Content>
                        <Text variant='headlineMedium' style={{ textAlign: "center", marginBottom: Spacing.defaultSpace }}>
                            Login
                        </Text>
                        <TextInput
                            label='Username'
                            style={{ marginBottom: Spacing.defaultSpace }}
                            value={username}
                            onChangeText={(text) => {
                                setUsername(text);
                                if (usernameError) setUsernameError("");
                            }}
                            mode='outlined'
                            error={!!usernameError}
                        />

                        <TextInput
                            label='Password'
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                if (passwordError) setPasswordError("");
                            }}
                            mode='outlined'
                            secureTextEntry
                            error={!!passwordError}
                        />

                        <Button mode='contained' onPress={handleLogin} style={styles.submitButton} labelStyle={styles.submitButtonLabel}>
                            Submit
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
    backgroundImage: {
        opacity: 0.1,
        width: "100%",
    },
    container: {
        flex: 1,
        justifyContent: "center",
        padding: Spacing.defaultSpace,
        backgroundColor: "transparent",
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 8,
    },
    submitButton: {
        marginTop: Spacing.defaultSpace,
        borderRadius: 8,
        height: 56,
        justifyContent: "center",
    },
    submitButtonLabel: {
        fontSize: 16,
    },
});
