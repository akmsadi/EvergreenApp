import { PropsWithChildren } from "react";
import { Card } from "react-native-paper";

export default function AppCard({ children }: PropsWithChildren) {
    return (
        <Card
            mode='outlined'
            style={{
                marginBottom: 15,
            }}
        >
            <Card.Content>{children}</Card.Content>
        </Card>
    );
}
