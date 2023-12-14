import { useLocation } from "react-router-dom";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemButton from "@mui/material/ListItemButton";
import useSmartNavigate from "../../hooks/useSmartNavigate";
import useThemeStore from "../../state/useThemeStore";

export default function SidenavItem({
    path,
    label,
    icon,
    onClick,
}: {
    path?: string;
    label: string;
    isActive?: boolean;
    icon: React.ReactNode;
    onClick?: () => void;
}) {
    const navigate = useSmartNavigate();
    const location = useLocation();
    const isDarkMode = useThemeStore(state => state.isDarkMode);
    const isActive = location.pathname === path;

    const handleClick = () => {
        onClick?.();
        path && navigate(path);
    }

    return (
        <ListItem disablePadding>
            <ListItemButton
                onClick={handleClick}
                sx={{
                    pl: 3.5,
                    transition: "background-color 300ms, border-color 300ms",
                    borderTopRightRadius: 100,
                    borderBottomRightRadius: 100,
                    ...(isDarkMode ? {
                        border: 0.5,
                        borderLeft: 0,
                        borderColor: theme => isActive ? theme.palette.grey[500] : "transparent",
                    } : {
                        backgroundColor: isActive ? "rgb(214, 226, 251)" : "transparent",
                        "&:hover": {
                            backgroundColor: isActive ? "rgb(214, 226, 251)" : "rgb(228, 236, 250)",
                        },
                    })
                }}
            >
                <ListItemIcon>
                    {icon}
                </ListItemIcon>
                <ListItemText primary={label} />
            </ListItemButton>
        </ListItem>
    );
}