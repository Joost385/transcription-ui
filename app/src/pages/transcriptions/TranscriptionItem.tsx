import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Checkbox from "@mui/material/Checkbox";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import PeopleIcon from "@mui/icons-material/People";
import LanguageIcon from "@mui/icons-material/Language";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PsychologyIcon from "@mui/icons-material/Psychology";
import InterpreterModeIcon from "@mui/icons-material/InterpreterMode";
import useThemeStore from "../../state/useThemeStore";
import useConfirmStore from "../../state/useConfirmStore";
import useNotificationStore from "../../state/useNotificationStore";
import useTranscriptStore from "../../state/useTranscriptStore";
import TranscriptDownloadMenu from "../../components/TranscriptDownloadMenu";
import TranscriptionProgressIndicator from "../../components/TranscriptionProgressIndicator";
import { SxProps, Theme } from "@mui/material/styles";
import { ListSelections } from "../../hooks/useListSelections";
import { CollectionQuery } from "../../hooks/useCollectionQuery";
import {
    Transcription,
    TranscriptionState,
    useDeleteTranscription,
    getWhisperModelLabel,
    getNemoConfigLabel,
} from "../../models/Transcription";

export default function TranscriptionItem({
    transcription,
    listSelections,
    collectionQuery,
    sx,
}: {
    transcription: Transcription;
    listSelections: ListSelections<Transcription>;
    collectionQuery: CollectionQuery<Transcription>;
    sx?: SxProps<Theme>;
}) {
    const isDarkMode = useThemeStore(state => state.isDarkMode);
    const confirm = useConfirmStore(state => state.handleOpen);
    const notify = useNotificationStore(state => state.handleOpen);
    const showTranscript = useTranscriptStore(state => state.handleOpen);

    const deleteTranscription = useDeleteTranscription({
        onSuccess: () => {
            collectionQuery.removeItem(transcription);
            listSelections.removeSelection(transcription);
        },
        onError: () => notify({
            title: "Error",
            message: "An error occurred while deleting the transcription.",
        })
    });

    const handleDelete = () => confirm({
        color: "error",
        title: "Delete Transcription",
        message: "You are about to delete a transcription. Confirm to continue.",
        onConfirm: () => deleteTranscription.mutate(transcription),
    });

    const handleStateChange = (state: TranscriptionState) => {
        collectionQuery.replaceItem({ ...transcription, state });
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
                position: { xs: "absolute", md: "static" },
            }}>
                <Checkbox
                    checked={listSelections.isSelected(transcription)}
                    onClick={() => listSelections.toggleSelection(transcription)}
                />
            </Box>
            <Stack
                flex={1}
                gap={2}
                direction={{ xs: "column", md: "row" }}
                alignItems={{ md: "center" }}
                justifyContent="space-between"
            >
                <Stack gap={1}>
                    <Typography variant="subtitle1">
                        {transcription.recording.name}
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
                            <PsychologyIcon fontSize="inherit" />
                            {getWhisperModelLabel(transcription.whisper_model)}
                        </Typography>
                        {transcription.language &&
                            <Typography
                                gap={0.5}
                                display="flex"
                                alignItems="center"
                                fontSize={14}
                            >
                                <LanguageIcon fontSize="inherit" />
                                {transcription.language.toUpperCase()}
                            </Typography>
                        }
                        {transcription.num_speakers &&
                            <Typography
                                gap={0.5}
                                display="flex"
                                alignItems="center"
                                fontSize={14}
                            >
                                <PeopleIcon fontSize="inherit" />
                                {transcription.num_speakers}
                            </Typography>
                        }
                        {transcription.nemo_config &&
                            <Typography
                                gap={0.5}
                                display="flex"
                                alignItems="center"
                                fontSize={14}
                            >
                                <InterpreterModeIcon fontSize="inherit" />
                                {getNemoConfigLabel(transcription.nemo_config)}
                            </Typography>
                        }
                    </Stack>
                </Stack>
                <Stack
                    gap={3}
                    direction="row"
                    justifyContent="space-between"
                >
                    <TranscriptionProgressIndicator
                        transcription={transcription}
                        onChange={handleStateChange}
                        sx={{ flexDirection: { sx: "row", md: "row-reverse" } }}
                    />
                    <Stack
                        m={-1}
                        alignSelf="end"
                        direction="row"
                    >
                        <IconButton
                            title="View Transcript"
                            color="primary"
                            onClick={() => showTranscript(transcription)}
                            disabled={transcription.state !== TranscriptionState.Success}
                        >
                            <VisibilityIcon />
                        </IconButton>
                        <TranscriptDownloadMenu
                            transcription={transcription}
                            disabled={transcription.state !== TranscriptionState.Success}
                        />
                        <IconButton
                            title="Delete"
                            color="error"
                            onClick={handleDelete}
                            disabled={deleteTranscription.isLoading}
                        >
                            {deleteTranscription.isLoading ?
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
