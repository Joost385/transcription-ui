import { useEffect } from "react";
import Skeleton from "@mui/material/Skeleton";
import MicIcon from "@mui/icons-material/Mic";
import ClearIcon from "@mui/icons-material/Clear";
import ButtonBase from "@mui/material/ButtonBase";
import useQueryParam from "../../hooks/useQueryParam";
import { SxProps, Theme } from "@mui/material/styles";
import { useRecording } from "../../models/Recording";

export default function RecordingFilter({ sx }: { sx?: SxProps<Theme>; }) {
    const { parameter, clearParameter } = useQueryParam("recording_id");
    const recording = useRecording(parameter);

    useEffect(() => {
        if (parameter && recording.isSuccess && !recording.data) {
            clearParameter();
        }
    }, [recording.data, parameter]);

    return (
        <>
            {parameter &&
                <ButtonBase
                    sx={{
                        px: 2,
                        py: 0.75,
                        border: 0.5,
                        borderRadius: 100,
                        fontSize: "medium",
                        ...sx,
                    }}
                    onClick={clearParameter}
                >
                    <MicIcon sx={{
                        mr: 1,
                        fontSize: "inherit",
                    }} />
                    {recording.isSuccess ?
                        recording.data.name :
                        <Skeleton
                            width={100}
                            variant="rounded"
                        />
                    }
                    <ClearIcon sx={{
                        ml: 1,
                        fontSize: "inherit",
                    }} />
                </ButtonBase>
            }
        </>
    );
}