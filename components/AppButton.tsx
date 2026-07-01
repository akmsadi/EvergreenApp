import { Button } from "react-native-paper";

interface Props {
    title: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
    mode?: "contained" | "outlined" | "text";
}

export default function AppButton({ title, onPress, loading = false, disabled = false, mode = "contained" }: Props) {
    return (
        <Button mode={mode} onPress={onPress} loading={loading} disabled={disabled} style={{ marginTop: 15 }}>
            {title}
        </Button>
    );
}
