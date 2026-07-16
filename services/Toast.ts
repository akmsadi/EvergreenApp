let showToast: ((message: string) => void) | null = null;
export const Toast = {
    setHandler(handler: (message: string) => void) {
        showToast = handler;
    },

    show(message: string) {
        showToast?.(message);
    },

    success(message: string) {
        showToast?.(message);
    },

    error(message: string) {
        showToast?.(message);
    },

    info(message: string) {
        showToast?.(message);
    },
};