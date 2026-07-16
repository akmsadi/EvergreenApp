import { View } from "react-native";
import { Button, Card, Text } from "react-native-paper";
import { useScoringStore } from "../../stores/scoringStore";
import { calculateMatch } from "../../utils/MatchCalculator";

export default function Scoring() {
    const balls = useScoringStore((s) => s.balls);

    const summary = calculateMatch(balls);

    const addBall = useScoringStore((state) => state.addBall);

    function addRun(run: number) {
        addBall({
            id: Date.now(),

            matchId: 1,

            innings: 1,

            over: 0,

            ball: 1,

            batsmanId: 1,

            bowlerId: 1,

            runs: run,

            extraRuns: 0,

            ballType: "NORMAL",

            isWicket: false,

            strikerAfterBall: 1,

            nonStrikerAfterBall: 2,
        });
    }

    function addWicket() {
        addBall({
            id: Date.now(),

            matchId: 1,

            innings: 1,

            over: 0,

            ball: 1,

            batsmanId: 1,

            bowlerId: 1,

            runs: 0,

            extraRuns: 0,

            ballType: "NORMAL",

            isWicket: true,

            strikerAfterBall: 1,

            nonStrikerAfterBall: 2,
        });
    }

    const undoBall = useScoringStore((state) => state.undoBall);

    return (
        <View
            style={{
                flex: 1,
                padding: 15,
            }}
        >
            <Card>
                <Card.Content>
                    <Text variant='headlineSmall'>Bangladesh</Text>

                    <Text variant='displayMedium'>
                        {summary.score}/{summary.wickets}
                    </Text>

                    <Text>{summary.overs} Overs</Text>

                    <Text>RR {summary.runRate.toFixed(2)}</Text>
                </Card.Content>
            </Card>

            <View
                style={{
                    marginTop: 20,
                    flexDirection: "row",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                }}
            >
                {[0, 1, 2, 3, 4, 6].map((run) => (
                    <Button
                        key={run}
                        mode='contained'
                        style={{
                            width: "30%",
                            marginBottom: 10,
                        }}
                        onPress={() => addRun(run)}
                    >
                        {run}
                    </Button>
                ))}
            </View>
            <Button mode='outlined' style={{ marginTop: 20 }} onPress={undoBall}>
                Undo
            </Button>

            <Button mode='contained' buttonColor='#d32f2f' onPress={addWicket}>
                WICKET
            </Button>
        </View>
    );
}
