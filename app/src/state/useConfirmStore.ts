import { create } from "zustand";

type Color = "success" | "error";

type ConfirmState = {
    isOpen: boolean;
    color: Color;
    title: string;
    message: string;
    onConfirm: () => void;
    handleClose: () => void;
    handleOpen: ({
        color,
        title,
        message,
        onConfirm,
    }: {
        color: Color;
        title: string;
        message: string;
        onConfirm: () => void;
    }) => void;
}

const defaultState = {
    isOpen: false,
    color: "success" as Color,
    title: "",
    message: "",
    onConfirm: () => { },
}

const useConfirmStore = create<ConfirmState>()(
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

export default useConfirmStore;