import Stack from "@mui/material/Stack";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import EditNoteIcon from "@mui/icons-material/EditNote";
import TranscriptDownloadMenu from "./TranscriptDownloadMenu";
import PlayButton from "./PlayButton";
import DialogTransition from "./DialogTransition";
import CopyButton from "./CopyButton";
import useBreakpoint from "../hooks/useBreakpoint";
import useTranscriptStore from "../state/useTranscriptStore";
import useLocationChangeCallback from "../hooks/useLocationChangeCallback";
import { useTranscript } from "../models/Transcription";
import { formatSecondsToTimer } from "../utils/string";

export default function TranscriptDialog() {
    const isMobileLayout = useBreakpoint("md");
    const isOpen = useTranscriptStore(state => state.isOpen);
    const transcription = useTranscriptStore(state => state.transcription);
    const transcript = useTranscript(transcription, isOpen);
    const handleClose = useTranscriptStore(state => state.handleClose);
    useLocationChangeCallback(handleClose);

    return (
        <Dialog
            fullWidth
            fullScreen={isMobileLayout}
            open={isOpen}
            onClose={handleClose}
            maxWidth="md"
            TransitionComponent={DialogTransition}
        >
            <DialogTitle
                display="flex"
                alignItems="center"
            >
                <EditNoteIcon sx={{ mr: 1 }} />
                {transcription?.recording.name}
                <IconButton
                    sx={{ ml: "auto" }}
                    onClick={handleClose}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Stack gap={4} mt={2}>
                    {!transcript.isSuccess ?
                        Array.from({ length: 15 }, (_, i) =>
                            <Skeleton
                                key={i}
                                height={50}
                                variant="rounded"
                            />
                        ) :
                        !transcription?.identify_speakers ?
                            transcript.data.text :
                            (transcript.data.speaker_segments ?? []).map(segment =>
                                <Stack
                                    key={segment.start}
                                    position="relative"
                                    direction={{ sm: "row" }}
                                    gap={{ xs: 1, sm: 3 }}
                                >
                                    <Stack>
                                        <Typography
                                            variant="subtitle1"
                                            color="info.main"
                                            whiteSpace="nowrap"
                                        >
                                            {segment.speaker}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            {formatSecondsToTimer(segment.start)}
                                        </Typography>
                                    </Stack>
                                    <Typography mr={{ "sm": 10 }}>
                                        {segment.text}
                                    </Typography>
                                    {transcription?.recording &&
                                        <PlayButton
                                            controls
                                            autoPlay
                                            recording={transcription.recording}
                                            start={segment.start}
                                            end={segment.end}
                                            placement="top"
                                            sx={{
                                                top: 0,
                                                right: 0,
                                                position: "absolute",
                                            }}
                                        />
                                    }
                                </Stack>
                            )
                    }
                </Stack>
            </DialogContent>
            <DialogActions>
                {transcript.isSuccess &&
                    <CopyButton
                        text="Copy Transcript"
                        content={transcript.data.text}
                    />
                }
                {transcription &&
                    <TranscriptDownloadMenu
                        asButton
                        transcription={transcription}
                    />
                }
            </DialogActions>
        </Dialog>
    );
}