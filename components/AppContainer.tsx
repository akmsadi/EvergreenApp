import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

interface AppContainerProps {
    children: ReactNode;
}

export default function AppContainer({ children }: AppContainerProps) {
    return <View style={styles.container}>{children}</View>;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "transparent",
    },
});
