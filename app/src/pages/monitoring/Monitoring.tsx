import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import BarChartIcon from "@mui/icons-material/BarChart";
import SystemMonitor from "./SystemMonitor";
import TranscriptionMonitor from "./TranscriptionMonitor";

export default function Monitoring() {
    return (
        <>
            <Typography component="h1" variant="h5">
                <BarChartIcon sx={{
                    mr: 1.5,
                    fontSize: "inherit",
                    verticalAlign: "middle",
                }} />
                Monitoring
            </Typography>
            <Divider sx={{ mb: 4, mt: 2 }} />
            <Stack gap={4}>
                <TranscriptionMonitor />
                <SystemMonitor />
            </Stack>
        </>
    );
}