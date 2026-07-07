import { useState } from "react";
import { Pressable, View } from "react-native";
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

    function openMenu() {
        if (!visible) {
            setVisible(true);
        }
    }

    function closeMenu() {
        if (visible) {
            setVisible(false);
        }
    }

    return (
        <View style={{ marginTop: 12 }}>
            <Menu
                visible={visible}
                onDismiss={closeMenu}
                anchor={
                    <Pressable onPress={openMenu}>
                        <TextInput
                            label={label}
                            value={value}
                            mode='outlined'
                            editable={false}
                            right={<TextInput.Icon icon='menu-down' onPress={openMenu} />}
                        />
                    </Pressable>
                }
            >
                {options.map((option) => (
                    <Menu.Item
                        key={option.value}
                        title={option.label}
                        onPress={() => {
                            onChange(option.value);

                            closeMenu();
                        }}
                    />
                ))}
            </Menu>
        </View>
    );
}
