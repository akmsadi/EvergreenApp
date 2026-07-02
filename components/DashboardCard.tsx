import { Colors } from "@/constants/colors";
import { Spacing } from "@/constants/spacing";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, Card, Text, useTheme } from "react-native-paper";

interface DashboardCardProps {
    title: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;

    pendingSync?: number;

    onPress: () => void;
    onSync?: () => void;
}

export default function DashboardCard({ title, icon, pendingSync = 0, onPress, onSync }: DashboardCardProps) {
    const theme = useTheme();

    return (
        <Card mode='elevated' style={styles.card} onPress={onPress}>
            <Card.Content style={styles.content}>
                <View
                    style={[
                        styles.iconCircle,
                        {
                            backgroundColor: Colors.white,
                        },
                    ]}
                >
                    <MaterialCommunityIcons name={icon} size={34} color={theme.colors.primary} />
                </View>

                <Text variant='titleMedium' style={styles.title}>
                    {title}
                </Text>

                <View style={styles.bottom}>
                    {pendingSync > 0 && (
                        <Text variant='labelSmall' style={styles.pending}>
                            {pendingSync} Pending Sync
                        </Text>
                    )}

                    {onSync && (
                        <Button mode='contained-tonal' icon='sync' style={styles.syncButton} onPress={onSync}>
                            Sync
                        </Button>
                    )}
                </View>
            </Card.Content>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        width: "48%",
        marginBottom: Spacing.defaultSpace,
        backgroundColor: Colors.background,
    },

    content: {
        alignItems: "center",
        minHeight: 175,
        justifyContent: "space-between",
    },

    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: Spacing.defaultSpace,
    },

    title: {
        fontWeight: "600",
        textAlign: "center",
    },

    subtitle: {
        textAlign: "center",
        opacity: 0.7,
        marginTop: 4,
    },

    bottom: {
        width: "100%",
        marginTop: 16,
    },

    pending: {
        textAlign: "center",
        marginBottom: 8,
    },

    syncButton: {
        width: "100%",
        backgroundColor: Colors.white,
    },
});
