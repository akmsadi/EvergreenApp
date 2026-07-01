import { Alert, FlatList } from "react-native";
import { Button, Card, Text } from "react-native-paper";

import { useMatchSetupStore } from "../../../stores/matchSetupStore";
import { useTeamStore } from "../../../stores/teamStore";

export default function TeamSelectionStep() {
    const teams = useTeamStore((state) => state.teams);

    const { teamAId, teamBId, setTeamA, setTeamB, next, previous } = useMatchSetupStore();

    function selectTeam(teamId: number) {
        // Select Team A
        if (!teamAId) {
            setTeamA(teamId);
            return;
        }

        // Prevent same team
        if (teamAId === teamId) {
            Alert.alert("Invalid Selection", "Please select a different team.");
            return;
        }

        // Select Team B
        if (!teamBId) {
            setTeamB(teamId);
            next();
        }
    }

    return (
        <>
            <FlatList
                data={teams}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{
                    padding: 16,
                }}
                ListHeaderComponent={
                    <>
                        <Text variant='headlineSmall' style={{ marginBottom: 20 }}>
                            Select Teams
                        </Text>

                        <Text style={{ marginBottom: 10 }}>Team A: {teamAId ? teams.find((t) => t.id === teamAId)?.name : "Not Selected"}</Text>

                        <Text style={{ marginBottom: 20 }}>Team B: {teamBId ? teams.find((t) => t.id === teamBId)?.name : "Not Selected"}</Text>
                    </>
                }
                renderItem={({ item }) => (
                    <Card
                        mode='outlined'
                        style={{
                            marginBottom: 12,
                        }}
                        onPress={() => selectTeam(item.id)}
                    >
                        <Card.Content>
                            <Text variant='titleMedium'>{item.name}</Text>

                            <Text>{item.shortName}</Text>
                        </Card.Content>
                    </Card>
                )}
            />

            <Button
                mode='outlined'
                style={{
                    margin: 16,
                }}
                onPress={previous}
            >
                Back
            </Button>
        </>
    );
}
