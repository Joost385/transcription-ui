import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import useThemeStore from "../../state/useThemeStore";
import ColorModeToggle from "../ColorModeToggle";

export default function LayoutLogin({ children }: { children: React.ReactNode }) {
    const isDarkMode = useThemeStore(store => store.isDarkMode);

    return (
        <Container sx={{ pt: 10 }}>
            <ColorModeToggle sx={{
                position: "fixed",
                top: 16,
                right: 16,
            }} />
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                sx={{
                    width: ["100%", "80%", "60%", "40%"],
                    maxWidth: "600px",
                    mx: "auto",
                }}
            >
                <img
                    style={{
                        width: 200,
                        height: 80,
                        pointerEvents: "none",
                        userSelect: "none",
                    }}
                    src={isDarkMode ?
                        "/waveform-white.png" :
                        "/waveform-primary.png"
                    }
                />
                {children}
            </Box>
        </Container>
    );
}