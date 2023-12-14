import AppBar from "@mui/material/AppBar";
import Stack from "@mui/material/Stack";
import Slide from "@mui/material/Slide";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import MicIcon from "@mui/icons-material/Mic";
import MenuIcon from "@mui/icons-material/Menu";
import ColorModeToggle from "../ColorModeToggle";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import useBreakpoint from "../../hooks/useBreakpoint";
import useThemeStore from "../../state/useThemeStore";
import useRecorderStore from "../../state/useRecorderStore";
import UserMenu from "./UserMenu";

export default function Header() {
    const isDesktopLayout = !useBreakpoint("sm");
    const isDarkMode = useThemeStore(store => store.isDarkMode);
    const toggleSidenav = useThemeStore(store => store.toggleSidenav);
    const openRecorder = useRecorderStore(state => state.handleOpen);

    const show = !useScrollTrigger({
        threshold: 40,
    });

    const elevate = useScrollTrigger({
        threshold: 40,
        disableHysteresis: true,
    });

    return (
        <Slide
            in={show || isDesktopLayout}
            direction="down"
            appear={false}
        >
            <AppBar
                sx={{ bgcolor: "background.default" }}
                elevation={elevate && !isDesktopLayout ? 1 : 0}
            >
                <Toolbar>
                    <IconButton
                        size="large"
                        onClick={toggleSidenav}
                        sx={{ mr: 1, ml: -1 }}
                    >
                        <MenuIcon />
                    </IconButton>
                    {isDesktopLayout &&
                        <img
                            src={isDarkMode ?
                                "/waveform-white.png" :
                                "/waveform-primary.png"
                            }
                            style={{
                                width: 110,
                                height: 30,
                                pointerEvents: "none",
                                userSelect: "none",
                            }}
                        />

                    }
                    <Stack
                        gap={1}
                        ml="auto"
                        direction="row"
                        alignItems="center"
                    >
                        <IconButton
                            onClick={openRecorder}
                            sx={{ color: "text.primary" }}
                        >
                            <MicIcon />
                        </IconButton>
                        <ColorModeToggle />
                        <UserMenu />
                    </Stack>
                </Toolbar>
            </AppBar>
        </Slide>
    );
}
