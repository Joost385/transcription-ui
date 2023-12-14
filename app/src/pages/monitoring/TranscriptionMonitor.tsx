import { useQueryClient } from "@tanstack/react-query";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import WarningIcon from "@mui/icons-material/Warning";
import CircularProgress from "@mui/material/CircularProgress";
import useThemeStore from "../../state/useThemeStore";
import useBreakpoint from "../../hooks/useBreakpoint";
import useConfirmStore from "../../state/useConfirmStore";
import useNotificationStore from "../../state/useNotificationStore";
import { useTranscriptionStats } from "../../models/TranscriptionStats";
import { useTerminateAllTranscriptions } from "../../models/Transcription";

export default function TranscriptionMonitor() {
    const queryClient = useQueryClient();
    const isDarkMode = useThemeStore(state => state.isDarkMode);
    const isMobileLayout = useBreakpoint("sm");
    const stats = useTranscriptionStats();
    const confirm = useConfirmStore(state => state.handleOpen);
    const notify = useNotificationStore(state => state.handleOpen);

    const terminateAll = useTerminateAllTranscriptions({
        onSuccess: () => queryClient.invalidateQueries(["transcription_stats"]),
        onError: () => notify({
            title: "Error",
            message: "An error occurred while terminating transcriptions.",
        }),
    });

    const terminateAllConfirm = () => confirm({
        color: "error",
        title: "Terminate Transcriptions",
        message: "You are about to terminate all transcriptions. Do you want to continue?",
        onConfirm: terminateAll.mutate,
    });

    return (
        <Paper sx={{ p: 2 }}>
            <Stack
                mb={4}
                gap={2}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
            >
                <Stack
                    direction="row"
                    alignItems="center"
                >
                    <Typography
                        mr={2}
                        variant="h6"
                        component="h2"
                    >
                        Transcriptions
                    </Typography>
                    {stats.isSuccess &&
                        <Chip
                            size="small"
                            color="warning"
                            variant="outlined"
                            label={`${stats.data.n_pending} Pending`}
                        />
                    }
                </Stack>
                {!isMobileLayout &&
                    <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        onClick={terminateAllConfirm}
                        disabled={terminateAll.isLoading}
                        startIcon={terminateAll.isLoading ?
                            <CircularProgress size={18} /> :
                            <WarningIcon />
                        }
                    >
                        Terminate All
                    </Button>
                }
            </Stack>
            {stats.isSuccess &&
                <Grid container spacing={2}>
                    {Array.from({ length: stats.data.max_transcriptions }, (_, i) => {
                        const isRunning = i < stats.data.n_running;

                        return (
                            <Grid
                                item
                                key={i}
                                xs={12}
                                sm={6}
                            >
                                <Paper
                                    elevation={3}
                                    variant={isDarkMode ? "elevation" : "outlined"}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        position: "relative",
                                        height: 130,
                                    }}
                                >
                                    <Typography>
                                        Process {i + 1}
                                    </Typography>
                                    <Chip
                                        size="small"
                                        color={isRunning ? "primary" : "success"}
                                        label={isRunning ? "Running" : "Ready"}
                                        variant="outlined"
                                        sx={{
                                            width: 70,
                                            top: 12,
                                            left: 12,
                                            position: "absolute",
                                        }}
                                    />
                                    {isRunning &&
                                        <CircularProgress
                                            size={20}
                                            sx={{
                                                top: 12,
                                                right: 12,
                                                position: "absolute",
                                            }}
                                        />
                                    }
                                </Paper>
                            </Grid>
                        );
                    })}
                </Grid>
            }
            {isMobileLayout &&
                <Button
                    fullWidth
                    sx={{ mt: 2 }}
                    color="error"
                    variant="outlined"
                    onClick={terminateAllConfirm}
                    disabled={terminateAll.isLoading}
                    startIcon={terminateAll.isLoading ?
                        <CircularProgress size={20} /> :
                        <WarningIcon />
                    }
                >
                    Terminate All
                </Button>
            }
        </Paper>
    );
}