import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import ErrorIcon from "@mui/icons-material/Error";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import useUploadStore from "../state/useUploadStore";
import usePreventDataLoss from "../hooks/usePreventDataLoss";
import { TransitionGroup } from "react-transition-group";

export default function UploadsProgress() {
    const removeUpload = useUploadStore(state => state.removeUpload);
    const uploads = useUploadStore(state => state.uploads);
    const isUploading = uploads.some(({ status }) => status === "loading");

    usePreventDataLoss(isUploading);

    return (
        <TransitionGroup
            component={Stack}
            position="fixed"
            bottom={16}
            right={16}
            gap={2}
        >
            {uploads.map(upload => {
                const isError = upload.status === "error";
                const isLoading = upload.status === "loading";

                const handleClose = () => {
                    removeUpload(upload.id);
                }

                const handleCancel = () => {
                    upload.abort();
                    handleClose();
                }

                return (
                    <Collapse key={upload.id}>
                        <Paper
                            elevation={12}
                            sx={{
                                p: 2,
                                width: 400,
                                maxWidth: "calc(100vw - 32px)",
                            }}
                        >
                            <Stack
                                mb={1}
                                height={40}
                                direction="row"
                                alignItems="center"
                            >
                                {isError ?
                                    <ErrorIcon color="error" fontSize="small" /> :
                                    <FileUploadIcon fontSize="small" />
                                }
                                <Typography
                                    mx={1}
                                    maxWidth="100%"
                                    overflow="hidden"
                                    whiteSpace="nowrap"
                                    textOverflow="ellipsis"
                                    color={isError ? "error" : "text.secondary"}
                                >
                                    {upload.name}
                                </Typography>
                                {isLoading ?
                                    <Button
                                        size="small"
                                        color="error"
                                        sx={{ ml: "auto", mr: -1 }}
                                        onClick={handleCancel}
                                    >
                                        Cancel
                                    </Button> :
                                    <IconButton
                                        title="Close"
                                        size="small"
                                        sx={{ ml: "auto" }}
                                        onClick={handleClose}
                                    >
                                        <CloseIcon />
                                    </IconButton>
                                }
                            </Stack>
                            <Stack
                                direction="row"
                                alignItems="center"
                            >
                                {upload.progress === undefined ?
                                    <LinearProgress sx={{ flex: 1 }} /> :
                                    <>
                                        <LinearProgress
                                            sx={{ flex: 1, mr: 1 }}
                                            value={upload.progress}
                                            variant={
                                                isLoading && upload.progress === 100 ?
                                                    "indeterminate" :
                                                    "determinate"
                                            }
                                        />
                                        <Box minWidth={35}>
                                            <Typography
                                                variant="body2"
                                                textAlign="right"
                                                color="text.secondary"
                                            >
                                                {upload.progress}%
                                            </Typography>
                                        </Box>
                                    </>
                                }
                            </Stack>
                        </Paper>
                    </Collapse>
                );
            })}
        </TransitionGroup>
    );
}