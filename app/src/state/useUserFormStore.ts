import { create } from "zustand";
import { User } from "../models/User";

type UserCallback = (user: User) => void;

interface UserFormState {
    isOpen: boolean;
    user?: User;
    onSuccess?: UserCallback;
    handleOpen: ({
        user,
        onSuccess,
    }: {
        user?: User;
        onSuccess: UserCallback;
    }) => void;
    handleClose: () => void;
}

const defaultState = {
    isOpen: false,
    user: undefined,
    onSuccess: undefined,
}

const useUserFormStore = create<UserFormState>()(
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

export default useUserFormStore;