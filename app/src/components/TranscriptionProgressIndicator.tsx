import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Timer from "./Timer";
import { SxProps, Theme } from "@mui/material/styles";
import {
    Transcription,
    TranscriptionState,
    useTranscriptionProgress,
} from "../models/Transcription";

export default function TranscriptionProgressIndicator({
    transcription,
    onChange,
    sx,
}: {
    transcription: Transcription;
    onChange?: (state: TranscriptionState) => void;
    sx?: SxProps<Theme>;
}) {
    const progress = useTranscriptionProgress({
        transcription,
        refetchInterval: 5000,
        onChange,
    });

    return (
        <Stack
            gap={1}
            direction="row"
            alignItems="center"
            sx={sx}
        >
            {progress.state === TranscriptionState.Pending &&
                <Chip
                    sx={{ width: 75 }}
                    size="small"
                    variant="outlined"
                    label="Pending"
                />
            }
            {progress.state === TranscriptionState.Running &&
                <>
                    <Chip
                        sx={{ width: 75 }}
                        size="small"
                        variant="outlined"
                        color="info"
                        label="Running"
                    />
                    <Timer
                        dynamic
                        took={progress.took ?? 0}
                        fontSize={14}
                        fontSizeSeparator={12}
                    />
                </>
            }
            {progress.state === TranscriptionState.Success &&
                <>
                    <Chip
                        sx={{ width: 75 }}
                        size="small"
                        variant="outlined"
                        color="success"
                        label="Finished"
                    />
                    <Timer
                        took={progress.took ?? 0}
                        fontSize={14}
                        fontSizeSeparator={12}
                    />
                </>
            }
            {progress.state === TranscriptionState.Failure &&
                <Chip
                    sx={{ width: 75 }}
                    size="small"
                    variant="outlined"
                    color="error"
                    label="Failure"
                />
            }
        </Stack>
    );
}
