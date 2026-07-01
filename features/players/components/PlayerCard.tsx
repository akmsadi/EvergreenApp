import { View } from "react-native";
import { Card, Chip, Text } from "react-native-paper";
import { Player } from "../types";

interface Props {
    player: Player;
    onPress?: () => void;
}

export default function PlayerCard({ player, onPress }: Props) {
    return (
        <Card style={{ marginBottom: 12 }} onPress={onPress}>
            <Card.Content>
                <Text variant='titleMedium'>
                    #{player.jerseyNumber} {player.firstName} {player.lastName}
                </Text>

                <Text>{player.battingStyle}</Text>

                <Text>{player.bowlingStyle}</Text>

                <View
                    style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        marginTop: 10,
                        gap: 8,
                    }}
                >
                    {player.isCaptain && <Chip icon='star'>Captain</Chip>}

                    {player.isWicketKeeper && <Chip icon='gloves'>Wicket Keeper</Chip>}

                    <Chip>Bat #{player.battingPosition}</Chip>
                </View>
            </Card.Content>
        </Card>
    );
}
