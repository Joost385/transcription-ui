import { useEffect } from "react";
import Box from "@mui/material/Box";
import Slide from "@mui/material/Slide";
import Collapse from "@mui/material/Collapse";
import Stack from "@mui/material/Stack";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import Toolbar from "@mui/material/Toolbar";
import Backdrop from "@mui/material/Backdrop";
import IconButton from "@mui/material/IconButton";
import FolderIcon from "@mui/icons-material/Folder";
import CloseIcon from "@mui/icons-material/Close";
import MicIcon from "@mui/icons-material/Mic";
import HelpIcon from "@mui/icons-material/Help";
import EditNoteIcon from "@mui/icons-material/EditNote";
import PersonIcon from "@mui/icons-material/Person";
import BarChartIcon from "@mui/icons-material/BarChart";
import SidenavItem from "./SidenavItem";
import useSecurityStore from "../../state/useSecurityStore";
import useThemeStore from "../../state/useThemeStore";
import useRecorderStore from "../../state/useRecorderStore";
import useBreakpoint from "../../hooks/useBreakpoint";

export const SIDENAV_BREAKPOINT = "lg"
export const SIDENAV_WIDTH = "min(280px, 100vw)";

export default function Sidenav() {
    const isDesktopLayout = !useBreakpoint(SIDENAV_BREAKPOINT);
    const isDarkMode = useThemeStore(store => store.isDarkMode);
    const isOpen = useThemeStore(store => store.isSidenavOpen);
    const user = useSecurityStore(state => state.user);
    const openRecorder = useRecorderStore(state => state.handleOpen);
    const hideSidenav = useThemeStore(store => store.hideSidenav);
    const showSidenav = useThemeStore(store => store.showSidenav);
    const onClickItem = isDesktopLayout ? undefined : hideSidenav;

    useEffect(() => {
        isDesktopLayout ?
            showSidenav() :
            hideSidenav();
    }, [isDesktopLayout]);

    return (
        <>
            <Collapse
                in={isOpen && isDesktopLayout}
                orientation="horizontal"
                appear={false}
            >
                <Box width={SIDENAV_WIDTH} />
            </Collapse>
            <Slide
                in={isOpen}
                direction="right"
                appear={false}
            >
                <Box sx={{
                    position: "fixed",
                    bottom: 0,
                    left: 0,
                    top: 0,
                    bgcolor: "background.default",
                    width: SIDENAV_WIDTH,
                    zIndex: theme => isDesktopLayout ?
                        theme.zIndex.appBar - 1 :
                        theme.zIndex.drawer,
                }}>
                    <Box
                        pr={2}
                        pb={10}
                        overflow="auto"
                        height="100%"
                    >
                        {isDesktopLayout ?
                            <Toolbar sx={{ mb: 4 }} /> :
                            <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between"
                                my={2}
                                pl={3.5}
                            >
                                <img
                                    style={{
                                        width: 110,
                                        height: 35,
                                        pointerEvents: "none",
                                        userSelect: "none",
                                    }}
                                    src={isDarkMode ?
                                        "/waveform-white.png" :
                                        "/waveform-primary.png"
                                    }
                                />
                                <IconButton
                                    onClick={hideSidenav}
                                    size="large"
                                >
                                    <CloseIcon />
                                </IconButton>
                            </Stack>

                        }
                        <List>
                            <SidenavItem
                                path="/"
                                label="Recordings"
                                icon={<FolderIcon />}
                                onClick={onClickItem}
                            />
                            <SidenavItem
                                path="/transcriptions"
                                label="Transcriptions"
                                icon={<EditNoteIcon />}
                                onClick={onClickItem}
                            />
                            <SidenavItem
                                label="Recorder"
                                icon={<MicIcon />}
                                onClick={openRecorder}
                            />
                            <SidenavItem
                                path="/help"
                                label="Help"
                                icon={<HelpIcon />}
                                onClick={onClickItem}
                            />
                        </List>
                        {user?.admin &&
                            <>
                                <Divider sx={{ mr: 2 }} />
                                <List>
                                    <SidenavItem
                                        path="/users"
                                        label="Users"
                                        icon={<PersonIcon />}
                                        onClick={onClickItem}
                                    />
                                    <SidenavItem
                                        path="/monitoring"
                                        label="Monitoring"
                                        icon={<BarChartIcon />}
                                        onClick={onClickItem}
                                    />
                                </List>
                            </>
                        }
                    </Box>
                </Box>
            </Slide>
            <Backdrop
                open={isOpen && !isDesktopLayout}
                onClick={hideSidenav}
                sx={{ zIndex: theme => theme.zIndex.drawer - 1 }}
            />
        </>
    );
}