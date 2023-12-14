import { Breakpoint } from "@mui/material";
import useTheme from "@mui/material/styles/useTheme";
import useMediaQuery from "@mui/material/useMediaQuery";

export default function useBreakpoint(breakpoint: number | Breakpoint) {
    const theme = useTheme();
    const query = theme.breakpoints.down(breakpoint);
    return useMediaQuery(query);
}