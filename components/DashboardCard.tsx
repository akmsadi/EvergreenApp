import { StyleSheet } from "react-native";
import { Card } from "react-native-paper";

type Props = {
    title: string;
    subtitle?: string;
    onPress?: () => void;
};

export default function DashboardCard({ title, subtitle, onPress }: Props) {
    return (
        <Card mode='outlined' style={styles.card} onPress={onPress}>
            <Card.Title title={title} subtitle={subtitle} />
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        marginBottom: 15,
    },
});
