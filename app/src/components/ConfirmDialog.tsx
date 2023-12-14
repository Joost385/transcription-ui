import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import CheckIcon from "@mui/icons-material/Check";
import WarningIcon from "@mui/icons-material/Warning";
import DialogTransition from "./DialogTransition";
import useConfirmStore from "../state/useConfirmStore";
import useLocationChangeCallback from "../hooks/useLocationChangeCallback";

export default function ConfirmDialog() {
    const {
        isOpen,
        title,
        message,
        color,
        onConfirm,
        handleClose,
    } = useConfirmStore();

    useLocationChangeCallback(handleClose);

    const handleConfirm = () => {
        onConfirm();
        handleClose();
    }

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
                    Cancel
                </Button>
                <Button
                    color={color}
                    onClick={handleConfirm}
                    startIcon={
                        color === "success" ?
                            <CheckIcon /> :
                            <WarningIcon />
                    }
                >
                    Confirm
                </Button>
            </DialogActions>
        </Dialog>
    );
}