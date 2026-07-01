import { router } from "expo-router";
import DashboardCard from "../../components/DashboardCard";
import { usePlayerStore } from "../../stores/playerStore";
import { useTeamStore } from "../../stores/teamStore";

export default function Dashboard() {
    const teams = useTeamStore((state) => state.teams);

    const players = usePlayerStore((state) => state.players);

    return (
        <>
            <DashboardCard title={`Teams (${teams.length})`} subtitle='Manage Teams' onPress={() => router.push("/teams")} />
            <DashboardCard title={`Players (${players.length})`} subtitle='Manage Players' onPress={() => router.push("/players")} />
        </>
    );
}
