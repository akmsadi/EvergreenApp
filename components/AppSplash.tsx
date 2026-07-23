import { useEffect, useRef } from "react";
import { Animated, Dimensions, ImageBackground, StyleSheet, View } from "react-native";

const { width } = Dimensions.get("window");

export default function AppSplash() {
    const progress = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(progress, {
            toValue: width * 0.7,
            duration: 2000,
            useNativeDriver: false,
        }).start();
    }, [progress]);

    return (
        <ImageBackground source={require("@/assets/images/splash-image.webp")} style={styles.container} resizeMode='cover'>
            <View style={styles.progressContainer}>
                <Animated.View
                    style={[
                        styles.progressBar,
                        {
                            width: progress,
                        },
                    ]}
                />
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 40,
    },

    progressContainer: {
        width: "70%",
        height: 6,
        borderRadius: 3,
        backgroundColor: "rgba(255,255,255,0.25)",
        overflow: "hidden",
    },

    progressBar: {
        height: "100%",
        backgroundColor: "#7CFC00",
        borderRadius: 3,
    },
});
