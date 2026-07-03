import { UserModel } from "@/database/models/UserModel";
import UserRepository from "@/database/repositories/UserRepository";
import ApiService from "@/services/ApiService";
import SecureStorage from "@/services/SecureStorage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, View } from "react-native";
import { ActivityIndicator, Button, Card, Text, TextInput } from "react-native-paper";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
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
        try {
            const user = await ApiService.login<UserModel>(username, password);
            await SecureStorage.setToken(user.token);
            UserRepository.save(user);
            router.replace("/(tabs)/dashboard");
        } catch (error) {
            console.error("Login error:", error);

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
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                padding: 20,
            }}
        >
            <Card>
                <Card.Content>
                    <Text variant='headlineMedium'>Evergreen Scorer</Text>
                    <TextInput label='Username' value={username} onChangeText={setUsername} mode='outlined' style={{ marginTop: 20 }} />
                    <TextInput label='Password' value={password} onChangeText={setPassword} mode='outlined' secureTextEntry style={{ marginTop: 10 }} />
                    <Button mode='contained' onPress={handleLogin} style={{ marginTop: 20 }}>
                        Login
                    </Button>
                </Card.Content>
            </Card>
        </View>
    );
}
