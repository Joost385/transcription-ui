import { TransitionGroup } from "react-transition-group";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import EditNoteIcon from "@mui/icons-material/EditNote";
import RecordingFilter from "./RecordingFilter";
import TranscriptionItem from "./TranscriptionItem";
import NoResults from "../../components/NoResults";
import ListSkeleton from "../../components/ListSkeleton";
import useQueryParam from "../../hooks/useQueryParam";
import useListSelections from "../../hooks/useListSelections";
import useConfirmStore from "../../state/useConfirmStore";
import useNotificationStore from "../../state/useNotificationStore";
import useTranscriptionFormStore from "../../state/useTranscriptionFormStore";
import { useRecording } from "../../models/Recording";
import {
    Transcription,
    transcriptionsEqual,
    useDeleteTranscriptions,
    useTranscriptions,
} from "../../models/Transcription";

export default function Transcriptions() {
    const { parameter: recordingId } = useQueryParam("recording_id");
    const confirm = useConfirmStore(state => state.handleOpen);
    const notify = useNotificationStore(state => state.handleOpen);
    const transcribe = useTranscriptionFormStore(state => state.handleOpen);
    const listSelections = useListSelections<Transcription>(transcriptionsEqual);
    const transcriptions = useTranscriptions(recordingId);
    const recording = useRecording(recordingId);

    const deleteTranscriptions = useDeleteTranscriptions({
        onSuccess: () => {
            listSelections.clearSelections();
            transcriptions.removeItems(listSelections.selections);
        },
        onError: () => notify({
            title: "Error",
            message: `An error occurred while deleteing ${listSelections.selections} transcriptions.`,
        }),
    });

    const confirmDeleteSelection = () => confirm({
        color: "error",
        title: "Delete Transcriptions",
        message: `You are about to delete ${listSelections.selections.length} transcription(s). Confirm to continue.`,
        onConfirm: () => deleteTranscriptions.mutate(listSelections.selections),
    });

    const handleTranscribe = () => {
        !recordingId ?
            transcribe({ onSuccess: transcriptions.addItem }) :
            transcribe({
                recording: recording.data,
                onSuccess: transcriptions.addItem,
            });
    };

    return (
        <>
            <Typography
                variant="h5"
                component="h1"
                display="flex"
                flexWrap="wrap"
                justifyContent="space-between"
                gap={2}
            >
                <Stack
                    direction="row"
                    alignItems="center"
                >
                    <EditNoteIcon sx={{
                        mr: 1,
                        fontSize: "inherit",
                    }} />
                    Transcriptions
                </Stack>
                <RecordingFilter />
            </Typography>
            <Divider sx={{ mt: 2, mb: 4 }} />
            {!transcriptions.isSuccess ?
                <ListSkeleton /> :
                <>
                    {transcriptions.data.length === 0 ?
                        <NoResults
                            message="Start a new transcription by clicking below"
                            actions={
                                <Button
                                    startIcon={<AddIcon />}
                                    onClick={handleTranscribe}
                                >
                                    {recordingId ?
                                        "Transcribe File" :
                                        "New Transcription"
                                    }
                                </Button>
                            }
                        /> :
                        <>
                            <Stack
                                mb={2}
                                gap={2}
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between"
                            >
                                <Typography
                                    color="text.secondary"
                                    whiteSpace="nowrap"
                                >
                                    {transcriptions.data.length} Transcription
                                    {transcriptions.data.length !== 1 && "s"}
                                </Typography>
                                <Stack
                                    direction="row"
                                    justifyContent="end"
                                    flexWrap="wrap-reverse"
                                >
                                    {listSelections.selections.length > 0 &&
                                        <Button
                                            color="error"
                                            onClick={confirmDeleteSelection}
                                            disabled={deleteTranscriptions.isLoading}
                                        >
                                            Delete ({listSelections.selections.length})
                                        </Button>
                                    }
                                    <Button
                                        startIcon={<AddIcon />}
                                        onClick={handleTranscribe}
                                    >
                                        {recordingId ?
                                            "Transcribe File" :
                                            "Transcribe"
                                        }
                                    </Button>
                                </Stack>
                            </Stack>
                            <TransitionGroup>
                                {transcriptions.data.map(transcription =>
                                    <Collapse key={transcription.id}>
                                        <TranscriptionItem
                                            transcription={transcription}
                                            listSelections={listSelections}
                                            collectionQuery={transcriptions}
                                            sx={{ mb: 2 }}
                                        />
                                    </Collapse>
                                )}
                            </TransitionGroup>
                        </>
                    }
                </>
            }
        </>
    );
}
