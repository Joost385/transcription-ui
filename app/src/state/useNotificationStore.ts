import { create } from "zustand";

type NotificationState = {
    isOpen: boolean;
    title: string;
    message: string;
    handleClose: () => void;
    handleOpen: ({
        title,
        message,
    }: {
        title: string;
        message: string;
    }) => void;
}

const defaultState = {
    isOpen: false,
    title: "",
    message: "",
}

const useNotificationStore = create<NotificationState>()(
    set => ({
        ...defaultState,
        handleClose: () => set({ isOpen: false }),
        handleOpen: options => set({
            ...defaultState,
            ...options,
            isOpen: true,
        }),
    })
);

export default useNotificationStore;