import { TransitionGroup } from "react-transition-group";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import Collapse from "@mui/material/Collapse";
import ListSkeleton from "../../components/ListSkeleton";
import UserItem from "./UserItem";
import PersonIcon from "@mui/icons-material/Person";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import useUserFormStore from "../../state/useUserFormStore";
import { useUsers } from "../../models/User";

export default function Users() {
    const users = useUsers();
    const handleOpenForm = useUserFormStore(state => state.handleOpen);
    const handleCreateUser = () => handleOpenForm({ onSuccess: users.addItem });

    return (
        <>
            <Typography
                component="h1"
                variant="h5"
                display="flex"
                alignItems="center"
            >
                <PersonIcon sx={{
                    mr: 1,
                    fontSize: "inherit",
                }} />
                Users
            </Typography>
            <Divider sx={{ mt: 2, mb: 4 }} />
            {!users.isSuccess ?
                <ListSkeleton /> :
                <>
                    <Stack
                        mb={2}
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                    >
                        <Typography color="text.secondary">
                            {users.data.length} User
                            {users.data.length !== 1 && "s"}
                        </Typography>
                        <Button
                            onClick={handleCreateUser}
                            startIcon={<PersonAddIcon />}
                        >
                            Create User
                        </Button>
                    </Stack>
                    <TransitionGroup>
                        {users.data.map(user =>
                            <Collapse key={user.id}>
                                <UserItem
                                    user={user}
                                    collectionQuery={users}
                                    sx={{ mb: 2 }}
                                />
                            </Collapse>
                        )}
                    </TransitionGroup>
                </>
            }
        </>
    );
}
