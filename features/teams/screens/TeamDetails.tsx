import PlayerCard from "@/features/players/components/PlayerCard";
import { router, useLocalSearchParams } from "expo-router";
import { ScrollView } from "react-native";
import { Button, Card, Divider, Text } from "react-native-paper";
import { usePlayerStore } from "../../../stores/playerStore";
import { useTeamStore } from "../../../stores/teamStore";

export default function TeamDetails() {
    const { id } = useLocalSearchParams();
    const getTeam = useTeamStore((s) => s.getTeam);
    const team = getTeam(Number(id));

    const players = usePlayerStore((s) => s.players);

    const teamPlayers = players.filter((player) => player.teamId === Number(id));

    return (
        <ScrollView
            contentContainerStyle={{
                padding: 16,
            }}
        >
            <Card>
                <Card.Content>
                    <Text variant='headlineSmall'>{team?.name}</Text>

                    <Text>{team?.shortName}</Text>

                    <Text>Team ID : {id}</Text>
                </Card.Content>
            </Card>

            <Divider style={{ marginVertical: 20 }} />

            <Card style={{ marginTop: 20 }}>
                <Card.Content>
                    <Text variant='titleLarge'>Players</Text>

                    {teamPlayers.map((player) => (
                        <PlayerCard key={player.id} player={player} />
                    ))}
                </Card.Content>
            </Card>

            <Button
                mode='contained'
                onPress={() => {
                    router.push({
                        pathname: "/players/add",

                        params: {
                            teamId: id,
                        },
                    });
                }}
            >
                Add Player
            </Button>
        </ScrollView>
    );
}
