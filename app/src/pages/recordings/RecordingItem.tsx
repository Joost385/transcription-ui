import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Checkbox from "@mui/material/Checkbox";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import DeleteIcon from "@mui/icons-material/Delete";
import TimerIcon from "@mui/icons-material/Timer";
import TodayIcon from "@mui/icons-material/Today";
import EditNoteIcon from "@mui/icons-material/EditNote";
import StorageIcon from "@mui/icons-material/Storage";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import useThemeStore from "../../state/useThemeStore";
import useConfirmStore from "../../state/useConfirmStore";
import useNotificationStore from "../../state/useNotificationStore";
import useTranscriptionFormStore from "../../state/useTranscriptionFormStore";
import PlayButton from "../../components/PlayButton";
import { SxProps, Theme } from "@mui/material/styles";
import { ListSelections } from "../../hooks/useListSelections";
import { CollectionQuery } from "../../hooks/useCollectionQuery";
import { Recording, downloadRecording, useDeleteRecording } from "../../models/Recording";
import { formatByteSize, formatDateString, formatSecondsToDuration } from "../../utils/string";

export default function RecordingItem({
    recording,
    listSelections,
    collectionQuery,
    sx,
}: {
    recording: Recording;
    listSelections: ListSelections<Recording>;
    collectionQuery: CollectionQuery<Recording>;
    sx?: SxProps<Theme>;
}) {
    const isDarkMode = useThemeStore(state => state.isDarkMode);
    const navigate = useNavigate();
    const confirm = useConfirmStore(state => state.handleOpen);
    const notify = useNotificationStore(state => state.handleOpen);
    const transcribe = useTranscriptionFormStore(state => state.handleOpen);

    const deleteRecording = useDeleteRecording({
        onSuccess: () => {
            collectionQuery.removeItem(recording);
            listSelections.removeSelection(recording);
        },
        onError: () => notify({
            title: "Error",
            message: "An error occurred while deleting the recording.",
        })
    });

    const handleDelete = () => confirm({
        color: "error",
        title: "Delete Recording",
        message: "You are about to delete a recording. This will also delete all corresponding transcripts. Confirm to continue.",
        onConfirm: () => deleteRecording.mutate(recording),
    });

    const showTranscriptions = () => {
        navigate(`/transcriptions?recording_id=${recording.id}`);
    }

    return (
        <Paper
            sx={{
                p: 2,
                gap: 2,
                borderRadius: 3,
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                position: "relative",
                ...sx,
            }}
            variant="elevation"
            elevation={isDarkMode ? 1 : 0}
        >
            <Box sx={{
                top: 10,
                right: 6,
                position: { xs: "absolute", sm: "static" },
            }}>
                <Checkbox
                    checked={listSelections.isSelected(recording)}
                    onClick={() => listSelections.toggleSelection(recording)}
                />
            </Box>
            <Stack
                flex={1}
                gap={2}
                direction={{ xs: "column", sm: "row" }}
                alignItems={{ sm: "center" }}
                justifyContent="space-between"
            >
                <Stack gap={1}>
                    <Typography variant="subtitle1">
                        {recording.name}
                    </Typography>
                    <Stack
                        rowGap={1}
                        columnGap={1.5}
                        flexWrap="wrap"
                        direction="row"
                        color="text.secondary"
                    >
                        <Typography
                            gap={0.5}
                            display="flex"
                            alignItems="center"
                            fontSize={14}
                        >
                            <TodayIcon fontSize="inherit" />
                            {formatDateString(recording.created_at)}
                        </Typography>
                        <Typography
                            gap={0.5}
                            fontSize={14}
                            display="flex"
                            alignItems="center"
                        >
                            <TimerIcon fontSize="inherit" />
                            {formatSecondsToDuration(recording.duration)}
                        </Typography>
                        <Typography
                            gap={0.5}
                            display="flex"
                            alignItems="center"
                            fontSize={14}
                        >
                            <StorageIcon fontSize="inherit" />
                            {formatByteSize(recording.size)}
                        </Typography>
                    </Stack>
                </Stack>
                <Stack gap={1}>
                    <Button
                        size="small"
                        onClick={showTranscriptions}
                        sx={{ m: -0.5, alignSelf: "start" }}
                    >
                        Show Transcriptions
                    </Button>
                    <Stack
                        m={-1}
                        alignSelf="end"
                        direction="row"
                    >
                        <IconButton
                            color="primary"
                            title="Transcribe"
                            onClick={() => transcribe({ recording })}
                        >
                            <EditNoteIcon />
                        </IconButton>
                        <PlayButton
                            autoPlay
                            controls
                            recording={recording}
                            placement="left"
                        />
                        <IconButton
                            color="primary"
                            title="Download"
                            onClick={() => downloadRecording(recording)}
                        >
                            <FileDownloadIcon />
                        </IconButton>
                        <IconButton
                            onClick={handleDelete}
                            disabled={deleteRecording.isLoading}
                            color="error"
                            title="Delete"
                        >
                            {deleteRecording.isLoading ?
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