import { useState } from "react";
import RecordRTC from "recordrtc";
import Box from "@mui/material/Box";
import Slide from "@mui/material/Slide";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import ButtonBase from "@mui/material/ButtonBase";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import CloseIcon from "@mui/icons-material/Close";
import MicIcon from "@mui/icons-material/Mic";
import PauseIcon from "@mui/icons-material/Pause";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadIcon from "@mui/icons-material/Upload";
import DownloadIcon from "@mui/icons-material/Download";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import Timer from "./Timer";
import DialogTransition from "./DialogTransition";
import useThemeStore from "../state/useThemeStore";
import useConfirmStore from "../state/useConfirmStore";
import useRecorderStore from "../state/useRecorderStore";
import useNotificationStore from "../state/useNotificationStore";
import usePreventDataLoss from "../hooks/usePreventDataLoss";
import { useRecordingUpload } from "../models/Recording";
import { downloadBlob } from "../utils/download";

// TODO research if cleanup of recorder instance is needed.
//      respect upload max size
//          -> notify before limit reached
//          -> validate recording before upload
//          -> download as fallback to prevent data loss
//      fix wrong timer after pause
//      fix recorder height for less vh

const MIME_TYPE = "audio/wav";

enum RecorderState {
    Inactive = "INACTIVE",
    Recording = "RECORDING",
    Paused = "PAUSED",
    Stopped = "STOPPED",
}

export default function Recorder() {
    const isOpen = useRecorderStore(state => state.isOpen);
    const handleOpen = useRecorderStore(state => state.handleOpen);
    const handleClose = useRecorderStore(state => state.handleClose);

    const [duration, setDuration] = useState<number>(0);
    const [recorder, setRecorder] = useState<RecordRTC | null>(null);
    const [recorderState, setRecorderState] = useState<RecorderState>(RecorderState.Inactive);
    const isInactive = recorderState === RecorderState.Inactive;
    const isRecording = recorderState === RecorderState.Recording;
    const isPaused = recorderState === RecorderState.Paused;

    const [filename, setFilename] = useState<string>("");
    const [isSaveDialogOpen, setIsSaveDialogOpen] = useState<boolean>(false);
    const openSaveDialog = () => setIsSaveDialogOpen(true);
    const closeSaveDialog = () => setIsSaveDialogOpen(false);

    const uploadRecording = useRecordingUpload();
    const notify = useNotificationStore(state => state.handleOpen);
    const confirm = useConfirmStore(state => state.handleOpen);

    const isTouchDevice = useThemeStore(state => state.isTouchDevice);

    usePreventDataLoss(!isInactive);

    const startRecording = async () => {
        if (isInactive) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const audioRecorder = new RecordRTC(stream, {
                    recorderType: RecordRTC.StereoAudioRecorder,
                    type: "audio",
                    mimeType: MIME_TYPE,
                    numberOfAudioChannels: 1,
                    disableLogs: true,
                    timeSlice: 1000,
                    ondataavailable: () => setDuration(prev => prev + 1),
                });
                setDuration(0);
                setRecorder(audioRecorder);
                setRecorderState(RecorderState.Recording);
                audioRecorder.startRecording();
            } catch (error: any) {
                notify({
                    title: "Error",
                    message: `
                        The recording could not be started.
                        Please ensure microphone permissions are granted.
                    `,
                });
            }
        }
    }

    const pauseRecording = () => {
        setRecorderState(RecorderState.Paused);
        recorder?.pauseRecording();
    }

    const resumeRecording = () => {
        setRecorderState(RecorderState.Recording);
        recorder?.resumeRecording();
    }

    const stopRecording = (callback: (file: File) => void) => {
        setRecorderState(RecorderState.Stopped);
        recorder?.stopRecording(() => {
            const blob = recorder.getBlob();
            const file = new File([blob], `${filename}.wav`, { type: MIME_TYPE });
            callback(file);
        });
    }

    const resetRecording = () => {
        setRecorderState(RecorderState.Inactive);
        recorder?.stopRecording();
        closeSaveDialog();
        setRecorder(null);
        setFilename("");
        setDuration(0);
    }

    const handleRecordButtonClick = () => {
        if (isRecording) {
            pauseRecording();
        } else if (isPaused) {
            resumeRecording();
        } else {
            startRecording();
        }
    }

    const handleDeleteButtonClick = () => {
        pauseRecording();
        confirm({
            color: "error",
            title: "Delete Recording",
            message: `
                You are about to delete the current recording.
                Do you want to continue?
            `,
            onConfirm: resetRecording,
        });
    }

    const handleSaveButtonClick = () => {
        pauseRecording();
        openSaveDialog();
    }

    const stopAndUploadRecording = () => {
        stopRecording(uploadRecording);
        resetRecording();
        handleClose();
    };

    const stopAndDownloadRecording = () => {
        stopRecording(file => downloadBlob(file, filename));
        resetRecording();
        handleClose();
    };

    return (
        <>
            <Slide
                unmountOnExit
                direction="up"
                in={!isOpen && (isRecording || isPaused)}
            >
                <Paper
                    onClick={handleOpen}
                    elevation={16}
                    sx={{
                        py: 2,
                        px: 4,
                        cursor: "pointer",
                        position: "fixed",
                        bottom: 0,
                        left: 16,
                        zIndex: theme => theme.zIndex.drawer - 1,
                        borderRadius: 0,
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                    }}
                >
                    <Stack
                        gap={2}
                        direction="row"
                        alignItems="center"
                    >
                        <Stack
                            gap={2}
                            direction="row"
                            alignItems="center"
                        >
                            <RadioButtonCheckedIcon color="error" />
                            <Timer
                                took={duration}
                                fontSize={30}
                                fontSizeSeparator={20}
                            />
                            <ExpandLessIcon />
                        </Stack>
                    </Stack>
                </Paper>
            </Slide>
            <Dialog
                open={isSaveDialogOpen}
                onClose={closeSaveDialog}
                TransitionComponent={DialogTransition}
            >
                <DialogTitle
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                >
                    Save Recording
                    <IconButton onClick={closeSaveDialog}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText mb={3}>
                        Choose a name for the recording.
                        Then upload the recording or download it onto your device.
                    </DialogContentText>
                    <TextField
                        fullWidth
                        label="Name"
                        value={filename}
                        onChange={e => setFilename(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        disabled={!filename}
                        onClick={stopAndDownloadRecording}
                        startIcon={<DownloadIcon />}
                    >
                        Download
                    </Button>
                    <Button
                        disabled={!filename}
                        onClick={stopAndUploadRecording}
                        startIcon={<UploadIcon />}
                    >
                        Upload
                    </Button>
                </DialogActions>
            </Dialog>
            <SwipeableDrawer
                open={isOpen}
                onClose={handleClose}
                onOpen={handleOpen}
                anchor="bottom"
                PaperProps={{
                    sx: {
                        p: 2,
                        mx: "auto",
                        maxWidth: 700,
                        maxHeight: "90vh",
                        minHeight: "min(90vh, 700px)",
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        bgcolor: "background.default",
                    }
                }}
            >
                {isTouchDevice ?
                    <Box
                        mx="auto"
                        height={6}
                        width={100}
                        borderRadius={3}
                        bgcolor="action.disabled"
                    /> :
                    <IconButton
                        size="large"
                        sx={{ ml: "auto" }}
                        onClick={handleClose}
                    >
                        <CloseIcon fontSize="inherit" />
                    </IconButton>
                }
                <Box mx="auto" py={12}>
                    <Timer
                        took={duration}
                        fontSize={50}
                        fontSizeSeparator={35}
                    />
                </Box>
                <Stack
                    mx="auto"
                    direction="row"
                    alignItems="end"
                    gap={3}
                >
                    <IconButton
                        size="large"
                        disabled={isInactive}
                        onClick={handleDeleteButtonClick}
                    >
                        <DeleteIcon />
                    </IconButton>
                    <ButtonBase
                        onClick={handleRecordButtonClick}
                        sx={{
                            width: 60,
                            height: 60,
                            borderRadius: 30,
                            fontSize: 28,
                            color: "white",
                            bgcolor: "error.main",
                        }}
                    >
                        {isRecording ?
                            <PauseIcon fontSize="inherit" /> :
                            <MicIcon fontSize="inherit" />
                        }
                    </ButtonBase>
                    <IconButton
                        size="large"
                        disabled={isInactive}
                        onClick={handleSaveButtonClick}
                    >
                        <SaveIcon />
                    </IconButton>
                </Stack>
            </SwipeableDrawer>
        </>
    );
}
