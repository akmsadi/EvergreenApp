import { Card, Text, TextInput } from "react-native-paper";

import { Team } from "../types";

type Props = {
    team: Team;
    playerCount: number;
    onPress?: () => void;
};

export default function TeamCard({ team, playerCount, onPress }: Props) {
    return (
        <Card mode='outlined' style={{ marginBottom: 12 }} onPress={onPress}>
            <TextInput placeholder='Search Team' />
            <Card.Title title={team.name} subtitle={`${playerCount ?? 0} Players`} />
            <Card.Content>
                <Text variant='titleMedium'>{team.name}</Text>

                <Text>{team.shortName}</Text>
            </Card.Content>
        </Card>
    );
}
