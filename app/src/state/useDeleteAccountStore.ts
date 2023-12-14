import { create } from "zustand";

type DeleteAccountStore = {
    isOpen: boolean;
    handleOpen: () => void;
    handleClose: () => void;
}

const useDeleteAccountStore = create<DeleteAccountStore>()(
    set => ({
        isOpen: false,
        handleOpen: () => set({ isOpen: true }),
        handleClose: () => set({ isOpen: false }),
    })
);

export default useDeleteAccountStore;