import { FlatList } from "react-native";

import { FAB } from "react-native-paper";

import { router } from "expo-router";

import { useTeamStore } from "../../../stores/teamStore";

import TeamCard from "../components/TeamCard";

import EmptyTeams from "../components/EmptyTeams";

export default function TeamList() {
    const teams = useTeamStore((state) => state.teams);

    return (
        <>
            <FlatList
                data={teams}
                keyExtractor={(item) => item.id.toString()}
                ListEmptyComponent={EmptyTeams}
                contentContainerStyle={{
                    padding: 16,
                }}
                renderItem={({ item }) => <TeamCard team={item} playerCount={0} onPress={() => router.push(`/teams/${item.id}`)} />}
            />

            <FAB
                icon='plus'
                style={{
                    position: "absolute",

                    right: 20,

                    bottom: 20,
                }}
                onPress={() => router.push("/teams/add")}
            />
        </>
    );
}
