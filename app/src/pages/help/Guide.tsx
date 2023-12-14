import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import UploadIcon from "@mui/icons-material/Upload";
import MicIcon from "@mui/icons-material/Mic";
import EditNoteIcon from "@mui/icons-material/EditNote";
import RouterLink from "../../components/RouterLink";
import useUploadStore from "../../state/useUploadStore";
import useRecorderStore from "../../state/useRecorderStore";
import useTranscriptionFormStore from "../../state/useTranscriptionFormStore";

export default function Guide() {
    const upload = useUploadStore(state => state.handleOpenUpload);
    const record = useRecorderStore(state => state.handleOpen);
    const transcribe = useTranscriptionFormStore(state => state.handleOpen);

    return (
        <Stack
            gap={2}
            mx="auto"
            maxWidth={850}
        >
            <Stack
                gap={2}
                direction="row"
                alignItems="center"
            >
                <Stack
                    width={36}
                    height={36}
                    fontWeight={500}
                    borderRadius={20}
                    fontSize="large"
                    alignItems="center"
                    justifyContent="center"
                    bgcolor="primary.main"
                    color="primary.contrastText"
                >
                    1
                </Stack>
                <Typography fontSize="large">
                    Upload a Recording
                </Typography>
            </Stack>
            <Stack
                gap={2}
                direction="row"
            >
                <Box mx="18px" borderLeft={1} />
                <Stack
                    py={2}
                    gap={2}
                    alignItems="start"
                >
                    <Typography>
                        To start transcribing, upload a recording in <b>MP3</b>, <b>WAV</b>, or <b>OGG</b> format.
                        You can also create and upload recordings directly using the built-in recorder.
                        To download or delete recordings, click <RouterLink text="here" href="/" />.
                    </Typography>
                    <Stack
                        gap={2}
                        direction="row"
                        flexWrap="wrap"
                    >
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
                    </Stack>
                </Stack>
            </Stack>
            <Stack
                gap={2}
                direction="row"
                alignItems="center"
            >
                <Stack
                    width={36}
                    height={36}
                    fontWeight={500}
                    borderRadius={20}
                    fontSize="large"
                    alignItems="center"
                    justifyContent="center"
                    bgcolor="primary.main"
                    color="primary.contrastText"
                >
                    2
                </Stack>
                <Typography fontSize="large">
                    Start a Transcription
                </Typography>
            </Stack>
            <Stack
                gap={2}
                direction="row"
            >
                <Box mx="18px" borderLeft={1} />
                <Stack
                    py={2}
                    gap={2}
                    alignItems="start"
                >
                    <Typography>
                        To start a transcription click below, select a file and set these options:
                    </Typography>
                    <ul>
                        <li>
                            <b>Whisper Model</b>: Select larger models for more accuracy. Keep in mind that larger models take longer.
                        </li>
                        <li>
                            <b>Speaker Detection</b>: You can enable speaker detection to generate a conversational transcript.
                        </li>
                        <li>
                            <b>Email Notification</b>: Some transcriptions take a long time. You can be notified once they finish.
                        </li>
                    </ul>
                    <Typography>
                        Monitor the progress of your transcription <RouterLink text="here" href="/transcriptions" />.
                    </Typography>
                    <Button
                        onClick={() => transcribe({})}
                        startIcon={<EditNoteIcon />}
                    >
                        New Transcription
                    </Button>
                </Stack>
            </Stack>
            <Stack
                gap={2}
                direction="row"
                alignItems="center"
            >
                <Stack
                    width={36}
                    height={36}
                    fontWeight={500}
                    borderRadius={20}
                    fontSize="large"
                    alignItems="center"
                    justifyContent="center"
                    bgcolor="primary.main"
                    color="primary.contrastText"
                >
                    3
                </Stack>
                <Typography fontSize="large">
                    View/Export Transcripts
                </Typography>
            </Stack>
            <Stack
                gap={2}
                direction="row"
            >
                <Box mx="18px" borderLeft={1} />
                <Stack
                    py={2}
                    gap={2}
                    alignItems="start"
                >
                    <Typography>
                        Once your transcription has finished,
                        go to the <RouterLink text="list view" href="/transcriptions" /> and click on the view symbol.
                        Transcripts can be exported as Text or JSON files.
                        If speaker detection was enabled, CSV and Excel are also available.
                    </Typography>
                </Stack>
            </Stack>
        </Stack>
    );
}