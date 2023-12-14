import "@fontsource/roboto/100.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "@fontsource/roboto/900.css";

import { createTheme } from "@mui/material/styles";
import MuiThemeProvider from "@mui/material/styles/ThemeProvider";
import CssBaseline from "@mui/material/CssBaseline";
import useThemeStore from "./state/useThemeStore";

const components = {
    MuiDialog: {
        styleOverrides: {
            root: {
                marginLeft: -8,
                marginRight: -8,
            },
        }
    }
}

export const LIGHT_THEME = createTheme({
    components,
    palette: {
        mode: "light",
        background: {
            default: "#f3f6fb",
        }
    },
});

export const DARK_THEME = createTheme({
    components,
    palette: {
        mode: "dark",
    },
});

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    const theme = useThemeStore(store => store.theme);

    return (
        <MuiThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </MuiThemeProvider>
    );
}
