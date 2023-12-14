import { useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import LogoutIcon from "@mui/icons-material/Logout";
import DeleteIcon from "@mui/icons-material/Delete";
import ListItemIcon from "@mui/material/ListItemIcon";
import useSecurityStore from "../../state/useSecurityStore";
import { logout } from "../../utils/security";
import useDeleteAccountStore from "../../state/useDeleteAccountStore";

export default function UserMenu() {
    const [anchorElement, setAnchorElement] = useState<null | HTMLElement>(null);
    const user = useSecurityStore(store => store.user);
    const deleteAccount = useDeleteAccountStore(state => state.handleOpen);

    const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorElement(event.currentTarget);
    }

    const handleClose = () => {
        setAnchorElement(null);
    }

    return (
        <>
            <IconButton onClick={handleOpen}>
                <Avatar sx={{
                    width: 32,
                    height: 32,
                    bgcolor: "secondary.main",
                }}>
                    {user?.firstname.charAt(0).toUpperCase()}
                </Avatar>
            </IconButton>
            <Menu
                open={!!anchorElement}
                anchorEl={anchorElement}
                onClick={handleClose}
                onClose={handleClose}
            >
                <MenuItem onClick={logout}>
                    <ListItemIcon>
                        <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    Logout
                </MenuItem>
                <MenuItem
                    onClick={deleteAccount}
                    sx={{ color: "error.main" }}
                >
                    <ListItemIcon>
                        <DeleteIcon
                            color="error"
                            fontSize="small"
                        />
                    </ListItemIcon>
                    Delete Account
                </MenuItem>
            </Menu>
        </>
    );
}