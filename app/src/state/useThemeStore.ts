import { Theme } from "@mui/material/styles";
import { create } from "zustand";
import { DARK_THEME, LIGHT_THEME } from "../ThemeProvider";
import { SIDENAV_BREAKPOINT } from "../components/layout/Sidenav";

type ThemeState = {
    theme: Theme;
    isDarkMode: boolean;
    isTouchDevice: boolean;
    isSidenavOpen: boolean;
    toggleTheme: () => void;
    showSidenav: () => void;
    hideSidenav: () => void;
    toggleSidenav: () => void;
}

const isDarkMode = (localStorage.getItem("theme-mode") ?? "dark") === "dark";
const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
const isSidenavOpen = matchMedia(DARK_THEME.breakpoints.up(SIDENAV_BREAKPOINT).replace("@media", "")).matches

const useThemeStore = create<ThemeState>(
    (set, get) => ({
        isDarkMode,
        isTouchDevice,
        isSidenavOpen,
        theme: isDarkMode ? DARK_THEME : LIGHT_THEME,
        toggleTheme: () => {
            const isDarkMode = !get().isDarkMode;
            const theme = isDarkMode ? DARK_THEME : LIGHT_THEME;
            localStorage.setItem("theme-mode", isDarkMode ? "dark" : "light");
            set({ theme, isDarkMode });
        },
        showSidenav: () => {
            set({ isSidenavOpen: true });
        },
        hideSidenav: () => {
            set({ isSidenavOpen: false });
        },
        toggleSidenav: () => {
            set({ isSidenavOpen: !get().isSidenavOpen });
        },
    })
);

export default useThemeStore;
