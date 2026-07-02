import { useState } from "react";
import { View } from "react-native";
import { Menu, TextInput } from "react-native-paper";

interface Option {
    label: string;
    value: string;
}

interface Props {
    label: string;
    value: string;
    options: Option[];
    onChange(value: string): void;
}

export default function AppSelect({ label, value, options, onChange }: Props) {
    const [visible, setVisible] = useState(false);

    return (
        <View style={{ marginTop: 12 }}>
            <Menu
                visible={visible}
                onDismiss={() => setVisible(false)}
                anchor={
                    <TextInput
                        label={label}
                        value={value}
                        mode='outlined'
                        editable={false}
                        right={<TextInput.Icon icon='menu-down' onPress={() => setVisible(true)} />}
                        onPressIn={() => setVisible(true)}
                    />
                }
            >
                {options.map((option) => (
                    <Menu.Item
                        key={option.value}
                        title={option.label}
                        onPress={() => {
                            onChange(option.value);

                            setVisible(false);
                        }}
                    />
                ))}
            </Menu>
        </View>
    );
}
