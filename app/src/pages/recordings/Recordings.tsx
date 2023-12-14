import { TransitionGroup } from "react-transition-group";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import Collapse from "@mui/material/Collapse";
import FolderIcon from "@mui/icons-material/Folder";
import MicIcon from "@mui/icons-material/Mic";
import UploadIcon from "@mui/icons-material/Upload";
import RecordingItem from "./RecordingItem";
import NoResults from "../../components/NoResults";
import ListSkeleton from "../../components/ListSkeleton";
import useUploadStore from "../../state/useUploadStore";
import useRecorderStore from "../../state/useRecorderStore";
import useConfirmStore from "../../state/useConfirmStore";
import useNotificationStore from "../../state/useNotificationStore";
import useListSelections from "../../hooks/useListSelections";
import {
    Recording,
    recordingsEqual,
    useRecordings,
    useDeleteRecordings,
} from "../../models/Recording";

export default function Recordings() {
    const confirm = useConfirmStore(state => state.handleOpen);
    const notify = useNotificationStore(state => state.handleOpen);
    const record = useRecorderStore(state => state.handleOpen);
    const upload = useUploadStore(state => state.handleOpenUpload);
    const listSelections = useListSelections<Recording>(recordingsEqual);
    const recordings = useRecordings();

    const deleteRecordings = useDeleteRecordings({
        onSuccess: () => {
            listSelections.clearSelections();
            recordings.removeItems(listSelections.selections);
        },
        onError: () => notify({
            title: "Error",
            message: "An error occurred while deleteing the recordings.",
        }),
    });

    const confirmDeleteSelection = () => confirm({
        color: "error",
        title: "Delete Recordings",
        message: `You are about to delete ${listSelections.selections.length} recording(s). Confirm to continue.`,
        onConfirm: () => deleteRecordings.mutate(listSelections.selections),
    });

    return (
        <>
            <Typography
                component="h1"
                variant="h5"
                display="flex"
                alignItems="center"
            >
                <FolderIcon sx={{
                    mr: 1,
                    fontSize: "inherit",
                }} />
                Recordings
            </Typography>
            <Divider sx={{ mt: 2, mb: 4 }} />
            {!recordings.isSuccess ?
                <ListSkeleton /> :
                <>
                    {recordings.data.length === 0 ?
                        <NoResults
                            message="Upload or create a new recording by clicking below"
                            actions={
                                <>
                                    <Button
                                        onClick={upload}
                                        startIcon={<UploadIcon />}
                                    >
                                        Upload
                                    </Button>
                                    <Button
                                        onClick={record}
                                        startIcon={<MicIcon />}
                                    >
                                        Record
                                    </Button>
                                </>
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
                                    {recordings.data.length} Recording
                                    {recordings.data.length !== 1 && "s"}
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
                                            disabled={deleteRecordings.isLoading}
                                        >
                                            Delete ({listSelections.selections.length})
                                        </Button>
                                    }
                                    <Button
                                        onClick={upload}
                                        startIcon={<UploadIcon />}
                                    >
                                        Upload
                                    </Button>
                                </Stack>
                            </Stack>
                            <TransitionGroup>
                                {recordings.data.map(recording =>
                                    <Collapse key={recording.id}>
                                        <RecordingItem
                                            recording={recording}
                                            listSelections={listSelections}
                                            collectionQuery={recordings}
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