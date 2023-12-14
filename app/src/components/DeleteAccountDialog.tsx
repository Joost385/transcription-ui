import { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Alert from "@mui/material/Alert";
import Collapse from "@mui/material/Collapse";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import CircularProgress from "@mui/material/CircularProgress";
import CloseIcon from "@mui/icons-material/Close";
import WarningIcon from "@mui/icons-material/Warning";
import DialogTransition from "./DialogTransition";
import useConfirmStore from "../state/useConfirmStore";
import useDeleteAccountStore from "../state/useDeleteAccountStore";
import useLocationChangeCallback from "../hooks/useLocationChangeCallback";
import { apiFetch } from "../utils/api";
import { logout } from "../utils/security";

const CONFIRM_TEXT = "delete my account"

export default function DeleteAccountDialog() {
    const [confirmText, setConfirmText] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [hasError, setHasError] = useState<boolean>(false);
    const isOpen = useDeleteAccountStore(state => state.isOpen);
    const handleClose = useDeleteAccountStore(state => state.handleClose);
    const confirm = useConfirmStore(state => state.handleOpen);

    useLocationChangeCallback(handleClose);

    const handleSubmit = () => confirm({
        color: "error",
        title: "Confirm Deletion",
        message: "All your data will be lost. Do you want to proceed?",
        onConfirm: async () => {
            setHasError(false);
            setIsLoading(true);
            const response = await apiFetch("users/me", { method: "DELETE" });
            setIsLoading(false);
            if (response.ok) {
                handleClose();
                logout();
            } else {
                setHasError(true);
            }
        }
    });

    const isConfirmed = confirmText.toLowerCase() === CONFIRM_TEXT;

    return (
        <Dialog
            fullWidth
            maxWidth="sm"
            open={isOpen}
            onClose={handleClose}
            TransitionComponent={DialogTransition}
        >
            <DialogTitle
                display="flex"
                justifyContent="space-between"
            >
                Delete Account
                <IconButton
                    disabled={isLoading}
                    onClick={handleClose}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Collapse in={hasError}>
                    <Alert sx={{ mb: 3 }} severity="error">
                        An error occurred
                    </Alert>
                </Collapse>
                <DialogContentText mb={2}>
                    To proceed type <b>{CONFIRM_TEXT}</b> below.
                </DialogContentText>
                <TextField
                    fullWidth
                    value={confirmText}
                    disabled={isLoading}
                    onChange={e => setConfirmText(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    color="error"
                    onClick={handleSubmit}
                    disabled={!isConfirmed || isLoading}
                    startIcon={
                        isLoading ?
                            <CircularProgress
                                color="inherit"
                                size={20}
                            /> :
                            <WarningIcon />
                    }
                >
                    Delete Account
                </Button>
            </DialogActions>
        </Dialog>
    );
}