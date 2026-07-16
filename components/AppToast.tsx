import { Toast } from "@/services/Toast";
import { useEffect, useState } from "react";
import { Snackbar } from "react-native-paper";

export default function AppToast() {
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        Toast.setHandler((text: string) => {
            setMessage(text);
            setVisible(true);
        });
    }, []);

    return (
        <Snackbar visible={visible} onDismiss={() => setVisible(false)} duration={3000}>
            {message}
        </Snackbar>
    );
}
