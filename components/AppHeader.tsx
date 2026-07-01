import { Appbar } from "react-native-paper";

interface Props {
    title: string;
}

export default function AppHeader({ title }: Props) {
    return (
        <Appbar.Header>
            <Appbar.Content title={title} />
        </Appbar.Header>
    );
}
