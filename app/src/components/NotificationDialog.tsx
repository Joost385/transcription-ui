import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogContentText from "@mui/material/DialogContentText"
import DialogTitle from "@mui/material/DialogTitle"
import DialogTransition from "./DialogTransition"
import useNotificationStore from "../state/useNotificationStore"
import useLocationChangeCallback from "../hooks/useLocationChangeCallback"

export default function NotificationDialog() {
    const {
        isOpen,
        title,
        message,
        handleClose,
    } = useNotificationStore();

    useLocationChangeCallback(handleClose);

    return (
        <Dialog
            fullWidth
            maxWidth="sm"
            open={isOpen}
            onClose={handleClose}
            TransitionComponent={DialogTransition}
        >
            <DialogTitle>
                {title}
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {message}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}