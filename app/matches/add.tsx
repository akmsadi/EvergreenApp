import { useRouter } from "expo-router";

import AppHeader from "@/components/AppHeader";
import MatchEditor from "@/components/MatchEditor";
import { MatchModel } from "@/database/models/MatchModel";
import MatchRepository from "@/database/repositories/MatchRepository";

export default function AddMatch() {
    const router = useRouter();

    const save = (match: MatchModel) => {
        MatchRepository.save(match);
        router.back();
    };

    return (
        <>
            <AppHeader title='New Match' showBack />

            <MatchEditor initialMatch={null} onSave={save} />
        </>
    );
}
