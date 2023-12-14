import { useState } from "react";
import { MuiFileInput } from "mui-file-input";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import CircularProgress from "@mui/material/CircularProgress";
import useUploadStore from "../state/useUploadStore";
import CloseIcon from "@mui/icons-material/Close";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import DialogTransition from "./DialogTransition";
import useLocationChangeCallback from "../hooks/useLocationChangeCallback";
import { useRecordingUpload } from "../models/Recording";
import { apiFetch } from "../utils/api";

export default function UploadDialog() {
    const [file, setFile] = useState<File | null>(null);
    const [isValidating, setIsValidating] = useState<boolean>(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    const handleRecordingUpload = useRecordingUpload();
    const showUploadDialog = useUploadStore(state => state.showUploadDialog);
    const handleCloseUpload = useUploadStore(state => state.handleCloseUpload);

    useLocationChangeCallback(handleCloseUpload);

    const handleChange = async (file: File | null) => {
        if (file) {
            const params = new URLSearchParams();
            params.append("mime_type", file.type);
            params.append("file_size", String(file.size));
            const queryString = params.toString();

            setIsValidating(true);
            const response = await apiFetch(`recordings/validate?${queryString}`);

            if (!response.ok) {
                const validationError = await response.json();
                setValidationError(validationError.detail);
            } else {
                setValidationError(null);
            }

            setIsValidating(false);
        } else {
            setValidationError(null);
        }

        setFile(file);
    }

    const handleSubmit = () => {
        if (file && !isValidating && !validationError) {
            handleRecordingUpload(file);
            handleCloseUpload();
            setFile(null);
        }
    }

    return (
        <Dialog
            fullWidth
            maxWidth="sm"
            open={showUploadDialog}
            onClose={handleCloseUpload}
            TransitionComponent={DialogTransition}
            sx={{ zIndex: "snackbar" }}
        >
            <DialogTitle
                display="flex"
                alignItems="center"
            >
                <FileUploadIcon sx={{ mr: 1 }} />
                Upload Recording
                <IconButton
                    sx={{ ml: "auto" }}
                    onClick={handleCloseUpload}
                    disabled={isValidating}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <DialogContentText mb={2}>
                    Please choose the recording that you want to upload.
                </DialogContentText>
                <MuiFileInput
                    fullWidth
                    value={file}
                    onChange={handleChange}
                    disabled={isValidating}
                    error={!!validationError}
                    helperText={validationError}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    color="primary"
                    onClick={handleCloseUpload}
                >
                    Cancel
                </Button>
                <Button
                    color="success"
                    onClick={handleSubmit}
                    disabled={!file || !!validationError || isValidating}
                    startIcon={
                        isValidating ?
                            <CircularProgress
                                color="inherit"
                                size={20}
                            /> :
                            <FileUploadIcon />
                    }
                >
                    Upload
                </Button>
            </DialogActions>
        </Dialog>
    );
}