import IconButton from "@mui/material/IconButton";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import useThemeStore from "../state/useThemeStore";
import { SxProps, Theme } from "@mui/material/styles";

export default function ColorModeToggle({ sx }: { sx?: SxProps<Theme> }) {
    const isDarkMode = useThemeStore(store => store.isDarkMode);
    const toggleTheme = useThemeStore(store => store.toggleTheme);

    return (
        <IconButton
            onClick={toggleTheme}
            sx={{ color: "text.primary", ...sx }}
        >
            {isDarkMode ?
                <LightModeIcon /> :
                <DarkModeIcon />
            }
        </IconButton>
    );
}
