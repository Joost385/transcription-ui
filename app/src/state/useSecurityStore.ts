import { create } from "zustand";
import { User, getCurrentUser } from "../models/User";

type SecurityState = {
    user: User | null;
    isLoading: boolean;
    token: string | null;
    setUser: (user: User | null) => void;
    setToken: (token: string | null) => void;
    loadUser: () => void;
}

const useSecurityStore = create<SecurityState>()(
    set => ({
        user: null,
        isLoading: true,
        token: localStorage.getItem("authToken"),
        setUser: user => set({ user }),
        setToken: token => {
            set({ token });
            token ?
                localStorage.setItem("authToken", token) :
                localStorage.removeItem("authToken");
        },
        loadUser: async () => {
            set({ isLoading: true });
            const user = await getCurrentUser();
            set({ user, isLoading: false });
        }
    })
);

export default useSecurityStore;