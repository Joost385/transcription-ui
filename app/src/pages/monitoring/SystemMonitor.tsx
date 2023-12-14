import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import useTheme from "@mui/material/styles/useTheme";
import { useSystemStat } from "../../models/SystemStats";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
);

export default function SystemStats() {
    const theme = useTheme();
    const windowLength = 150;
    const cpu = useSystemStat("cpu", windowLength);
    const gpu = useSystemStat("gpu", windowLength);
    const vram = useSystemStat("vram", windowLength);
    const memory = useSystemStat("memory.used_percent", windowLength);

    return (
        <Paper sx={{ p: 2 }}>
            <Typography
                variant="h6"
                component="h2"
                mb={2}
            >
                System Monitor
            </Typography>
            <div>
                <Line
                    height={400}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        animation: { duration: 0 },
                        color: theme.palette.text.primary,
                        scales: {
                            x: { display: false },
                            y: {
                                min: 0,
                                max: 100,
                                grid: { color: theme.palette.divider },
                                ticks: { color: theme.palette.text.secondary },
                            },
                        },
                    }}
                    data={{
                        labels: new Array(windowLength).fill(""),
                        datasets: [
                            {
                                label: "CPU",
                                data: cpu,
                                tension: 0.1,
                                pointRadius: 0,
                                borderColor: theme.palette.primary.main,
                            },
                            {
                                label: "RAM",
                                data: memory,
                                tension: 0.1,
                                pointRadius: 0,
                                borderColor: theme.palette.secondary.main,
                            },
                            ...(gpu === null ? [] : [{
                                label: "GPU",
                                data: gpu,
                                tension: 0.1,
                                pointRadius: 0,
                                borderColor: theme.palette.success.main,
                            }]),
                            ...(vram === null ? [] : [{
                                label: "VRAM",
                                data: vram,
                                tension: 0.1,
                                pointRadius: 0,
                                borderColor: theme.palette.error.light,
                            }]),
                        ],
                    }}
                />
            </div>
        </Paper>
    );
}