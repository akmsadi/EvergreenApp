import { Alert, FlatList } from "react-native";

import { Button, Card, Checkbox, Text } from "react-native-paper";

import { usePlayerStore } from "../../../stores/playerStore";

import { useMatchSetupStore } from "../../../stores/matchSetupStore";

interface Props {
    team: "A" | "B";
}

export default function PlayingXIStep({ team }: Props) {
    const players = usePlayerStore((s) => s.players);

    const {
        teamAId,

        teamBId,

        teamAPlayingXI,

        teamBPlayingXI,

        setTeamAPlayingXI,

        setTeamBPlayingXI,

        next,

        previous,
    } = useMatchSetupStore();

    const teamId = team === "A" ? teamAId : teamBId;

    const selected = team === "A" ? teamAPlayingXI : teamBPlayingXI;

    const setSelected = team === "A" ? setTeamAPlayingXI : setTeamBPlayingXI;

    const teamPlayers = players.filter((p) => p.teamId === teamId);

    function togglePlayer(id: number) {
        let list = [...selected];

        if (list.includes(id)) {
            list = list.filter((x) => x !== id);
        } else {
            if (list.length >= 11) {
                Alert.alert(
                    "Playing XI",

                    "Maximum 11 players",
                );

                return;
            }

            list.push(id);
        }

        setSelected(list);
    }

    function proceed() {
        if (selected.length !== 11) {
            Alert.alert(
                "Playing XI",

                "Select exactly 11 players.",
            );

            return;
        }

        next();
    }

    return (
        <>
            <FlatList
                data={teamPlayers}
                keyExtractor={(i) => i.id.toString()}
                contentContainerStyle={{
                    padding: 16,
                }}
                ListHeaderComponent={
                    <Text
                        variant='headlineSmall'
                        style={{
                            marginBottom: 20,
                        }}
                    >
                        Select Team {team} Playing XI
                    </Text>
                }
                renderItem={({ item }) => (
                    <Card
                        style={{
                            marginBottom: 10,
                        }}
                    >
                        <Card.Title
                            title={`${item.firstName} ${item.lastName}`}
                            right={() => <Checkbox status={selected.includes(item.id) ? "checked" : "unchecked"} onPress={() => togglePlayer(item.id)} />}
                        />
                    </Card>
                )}
            />

            <Button mode='outlined' onPress={previous}>
                Back
            </Button>

            <Button
                mode='contained'
                style={{
                    marginTop: 10,
                }}
                onPress={proceed}
            >
                Next
            </Button>
        </>
    );
}
