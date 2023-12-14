import { useEffect, useMemo, useState } from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { hoursMinutesSeconds } from "../utils/string";

export default function Timer({
    took,
    fontSize,
    fontSizeSeparator,
    dynamic,
}: {
    took: number;
    fontSize: number;
    fontSizeSeparator: number;
    dynamic?: boolean;
}) {
    const [duration, setDuration] = useState(took);

    useEffect(() => {
        setDuration(took);
    }, [took]);

    useEffect(() => {
        if (dynamic) {
            const interval = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [dynamic]);

    const [hours, minutes, seconds] = useMemo(
        () => hoursMinutesSeconds(duration),
        [duration]
    );

    return (
        <Stack
            direction="row"
            alignItems="center"
        >
            <Typography fontSize={fontSize}>
                {hours.toString().padStart(2, "0")}
            </Typography>
            <Typography fontSize={fontSizeSeparator}>:</Typography>
            <Typography fontSize={fontSize}>
                {minutes.toString().padStart(2, "0")}
            </Typography>
            <Typography fontSize={fontSizeSeparator}>:</Typography>
            <Typography fontSize={fontSize}>
                {seconds.toString().padStart(2, "0")}
            </Typography>
        </Stack>
    );
}
