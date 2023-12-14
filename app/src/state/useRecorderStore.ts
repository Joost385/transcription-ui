import { create } from "zustand";

type RecorederState = {
    isOpen: boolean;
    handleClose: () => void;
    handleOpen: () => void;
}

const useRecorderStore = create<RecorederState>()(
    set => ({
        isOpen: false,
        handleClose: () => set({ isOpen: false }),
        handleOpen: () => set({ isOpen: true }),
    })
);

export default useRecorderStore;