import { useRouter } from "expo-router";

import AppHeader from "@/components/AppHeader";
import MatchEditor from "@/components/MatchEditor";
import { MatchModel } from "@/database/models/MatchModel";
import MatchRepository from "@/database/repositories/MatchRepository";

export default function AddMatch() {
    const router = useRouter();

    const save = (match: MatchModel) => {
        const match_id = MatchRepository.save(match);
        router.push(`/matches/${match_id}/players`);
    };

    return (
        <>
            <AppHeader showBack />

            <MatchEditor initialMatch={null} onSave={save} />
        </>
    );
}
