import { TextInput } from "react-native-paper";

interface Props {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    secureTextEntry?: boolean;
}

export default function AppInput({ label, value, onChangeText, secureTextEntry }: Props) {
    return <TextInput mode='outlined' label={label} value={value} onChangeText={onChangeText} secureTextEntry={secureTextEntry} style={{ marginBottom: 15 }} />;
}
