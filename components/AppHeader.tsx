import { Colors } from "@/constants/colors";
import { Spacing } from "@/constants/spacing";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { IconButton, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

interface AppHeaderProps {
    title: string;
    subtitle?: string;
    showBack?: boolean;
    rightIcon?: string;
    onRightPress?: () => void;
}

export default function AppHeader({ title, subtitle, showBack = false, rightIcon, onRightPress }: AppHeaderProps) {
    const router = useRouter();

    return (
        <SafeAreaView edges={["top"]} style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.left}>
                    {showBack && (
                        <Pressable
                            onPress={() => router.back()}
                            style={{
                                width: 40,
                                height: 40,
                                justifyContent: "center",
                                alignItems: "center",
                                marginRight: 8,
                            }}
                        >
                            <MaterialCommunityIcons name='arrow-left' size={24} color={Colors.text} />
                        </Pressable>
                    )}

                    <View>
                        <Text variant='headlineSmall' style={styles.title}>
                            {title}
                        </Text>

                        {subtitle && (
                            <Text variant='bodyMedium' style={styles.subtitle}>
                                {subtitle}
                            </Text>
                        )}
                    </View>
                </View>

                {rightIcon && <IconButton icon={rightIcon} mode='contained' onPress={onRightPress} />}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.darkGray,
    },

    container: {
        height: 56,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: Spacing.defaultSpace,
    },

    left: {
        flexDirection: "row",
        alignItems: "center",
    },

    title: {
        fontSize: 22,
    },

    subtitle: {
        opacity: 0.6,
        marginTop: 2,
    },
});
