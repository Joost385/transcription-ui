import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import Switch from "@mui/material/Switch";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import useConfirmStore from "../../state/useConfirmStore";
import useSecurityStore from "../../state/useSecurityStore";
import useUserFormStore from "../../state/useUserFormStore";
import useNotificationStore from "../../state/useNotificationStore";
import useBreakpoint from "../../hooks/useBreakpoint";
import useThemeStore from "../../state/useThemeStore";
import { SxProps, Theme } from "@mui/material/styles";
import { CollectionQuery } from "../../hooks/useCollectionQuery";
import { User, useDeleteUser, useToggleUserActive } from "../../models/User";

export default function UserItem({
    user,
    collectionQuery,
    sx,
}: {
    user: User;
    collectionQuery: CollectionQuery<User>;
    sx?: SxProps<Theme>;
}) {
    const confirm = useConfirmStore(state => state.handleOpen);
    const notify = useNotificationStore(state => state.handleOpen);
    const handleOpenForm = useUserFormStore(state => state.handleOpen);
    const me = useSecurityStore(state => state.user);
    const isItMe = user.id === me?.id;
    const isMobileLayout = useBreakpoint("sm")
    const isDarkMode = useThemeStore(state => state.isDarkMode)

    const toggleActive = useToggleUserActive({
        onSuccess: () => collectionQuery.replaceItem({ ...user, active: !user.active }),
        onError: () => notify({
            title: "Error",
            message: "An error occurred while editing the user.",
        })
    });

    const deleteUser = useDeleteUser({
        onSuccess: () => collectionQuery.removeItem(user),
        onError: () => notify({
            title: "Error",
            message: "An error occurred while deleting the user.",
        })
    });

    const handleToggleActive = () => {
        toggleActive.mutate(user);
    }

    const handleDelete = () => confirm({
        color: "error",
        title: "Delete User",
        message: "You are about to delete a user. Confirm to continue.",
        onConfirm: () => deleteUser.mutate(user),
    });

    const handleEdit = () => {
        handleOpenForm({ user, onSuccess: collectionQuery.replaceItem });
    }

    return (
        <Paper
            sx={{ p: 2, borderRadius: 3, ...sx }}
            variant="elevation"
            elevation={isDarkMode ? 1 : 0}
        >
            <Stack
                gap={3}
                direction="row"
                alignItems="center"
            >
                {!isMobileLayout &&
                    <Switch
                        checked={user.active}
                        onClick={handleToggleActive}
                        disabled={toggleActive.isLoading || isItMe}
                        title={user.active ? "Deactivate User" : "Activate User"}
                    />
                }
                <Avatar sx={{
                    bgcolor: isItMe ?
                        "secondary.main" :
                        "primary.main"
                }}>
                    {user.firstname.charAt(0).toUpperCase()}
                    {user.lastname.charAt(0).toUpperCase()}
                </Avatar>
                <Stack
                    width={200}
                >
                    <Typography variant="subtitle1">
                        {user.firstname} {user.lastname}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ overflowWrap: "anywhere" }}>
                        {user.email}
                    </Typography>
                </Stack>
                <Stack
                    flex={1}
                    gap={2}
                    direction={{ xs: "column", md: "row" }}
                    alignItems={{ xs: "end", md: "center" }}
                    justifyContent="end"
                >
                    <Chip
                        size="small"
                        label={user.admin ? "Admin" : "User"}
                        color={user.admin ? "success" : "default"}
                        variant="outlined"
                        sx={{ width: 60 }}
                    />
                    <Stack
                        m={-1}
                        direction="row"
                        alignItems="center"
                    >
                        <IconButton
                            onClick={handleEdit}
                            color="primary"
                            title="Edit User"
                        >
                            <EditIcon />
                        </IconButton>
                        <IconButton
                            onClick={handleDelete}
                            disabled={deleteUser.isLoading || isItMe}
                            color="error"
                            title="Delete User"
                        >
                            {deleteUser.isLoading ?
                                <CircularProgress size={24} /> :
                                <DeleteIcon />
                            }
                        </IconButton>
                    </Stack>
                </Stack>
            </Stack>
        </Paper>
    );
}
