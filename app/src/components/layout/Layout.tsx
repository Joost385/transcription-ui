import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import Header from "./Header";
import Sidenav from "./Sidenav";
import Login from "../../pages/login/Login";
import Recorder from "../Recorder";
import UploadsProgress from "../UploadsProgress";
import UploadDialog from "../UploadDialog";
import ConfirmDialog from "../ConfirmDialog";
import UserFormDialog from "../../components/UserFormDialog";
import NotificationDialog from "../NotificationDialog";
import TranscriptDialog from "../TranscriptDialog";
import TranscriptionFormDialog from "../TranscriptionFormDialog";
import DeleteAccountDialog from "../DeleteAccountDialog";
import useSecurityStore from "../../state/useSecurityStore";

export default function Layout() {
    const user = useSecurityStore(store => store.user);
    const loadUser = useSecurityStore(store => store.loadUser);

    useEffect(() => {
        loadUser();
    }, []);

    return (
        <>
            {!user ?
                <Login /> :
                <Stack direction="row">
                    <Header />
                    <Sidenav />
                    <Container
                        maxWidth={false}
                        sx={{ py: 6, maxWidth: 960 }}
                    >
                        <Toolbar />
                        <Outlet />
                    </Container>
                </Stack>
            }
            <Recorder />
            <UploadsProgress />
            <UploadDialog />
            <ConfirmDialog />
            <UserFormDialog />
            <NotificationDialog />
            <TranscriptDialog />
            <TranscriptionFormDialog />
            <DeleteAccountDialog />
        </>
    );
}