import { useEffect } from "react";
import Alert from "@mui/material/Alert";
import Collapse from "@mui/material/Collapse";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import CloseIcon from "@mui/icons-material/Close";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DialogTransition from "./DialogTransition";
import useTranscriptionFormStore from "../state/useTranscriptionFormStore";
import useLocationChangeCallback from "../hooks/useLocationChangeCallback";
import { useRecordings } from "../models/Recording";
import { HttpStatus, apiFetch } from "../utils/api";
import { setFormErrors, ValidationErrors } from "../utils/validation";
import {
    useForm,
    SelectElement,
    TextFieldElement,
    CheckboxElement,
    RadioButtonGroup,
} from "react-hook-form-mui";
import {
    NEMO_CONFIGS,
    WHISPER_MODELS,
    TranscriptionEdit,
    transcriptionDefaultValues,
} from "../models/Transcription";

export default function TranscriptionFormDialog() {
    const isOpen = useTranscriptionFormStore(state => state.isOpen);
    const recording = useTranscriptionFormStore(state => state.recording);
    const onSuccess = useTranscriptionFormStore(state => state.onSuccess);
    const handleClose = useTranscriptionFormStore(state => state.handleClose);

    const recordings = useRecordings(isOpen);

    useLocationChangeCallback(handleClose);

    const {
        reset,
        watch,
        setValue,
        setError,
        handleSubmit,
        control,
        formState: {
            errors,
            isSubmitting,
        }
    } = useForm<TranscriptionEdit>();

    const identifySpeakers = watch("identify_speakers");

    useEffect(() => {
        if (isOpen) {
            recording ?
                reset({ ...transcriptionDefaultValues, recording_id: recording.id }) :
                reset(transcriptionDefaultValues);
        } else {
            setValue("identify_speakers", false);
        }
    }, [recording, isOpen]);

    const onSubmit = handleSubmit(
        async data => {
            const response = await apiFetch("transcriptions", {
                method: "POST",
                body: JSON.stringify(data),
                headers: { "Content-Type": "application/json" }
            });

            const responseData = await response.json();

            if (!response.ok) {
                if (response.status === HttpStatus.UnprocessableEntity) {
                    setFormErrors(responseData as ValidationErrors, setError);
                } else {
                    setError("root", { message: "An Error occurred while submitting the form." });
                }
            } else {
                onSuccess?.(responseData);
                handleClose();
            }
        }
    );

    return (
        <Dialog
            fullWidth
            maxWidth="sm"
            open={isOpen}
            onClose={isSubmitting ? undefined : handleClose}
            TransitionComponent={DialogTransition}
        >
            <DialogTitle
                display="flex"
                alignItems="center"
            >
                <EditNoteIcon sx={{ mr: 1 }} />
                {recording?.name ?? "Transcription"}
                <IconButton
                    sx={{ ml: "auto" }}
                    onClick={handleClose}
                    disabled={isSubmitting}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <form onSubmit={onSubmit}>
                <DialogContent>
                    <Collapse in={!!errors.root}>
                        <Alert sx={{ mb: 3 }} severity="error">
                            {errors.root?.message}
                        </Alert>
                    </Collapse>
                    <Stack gap={3}>
                        {!recording &&
                            <Autocomplete
                                loading={recordings.isLoading}
                                loadingText="Loading recordings ..."
                                options={recordings.data ?? []}
                                onChange={(_, value) => setValue("recording_id", value?.id)}
                                getOptionLabel={({ name }) => name}
                                renderOption={(props, option) => (
                                    <li {...props} key={option.id}>
                                        {option.name}
                                    </li>
                                )}
                                renderInput={params =>
                                    <TextField
                                        {...params}
                                        required
                                        label="Recording"
                                    />
                                }
                            />
                        }
                        <SelectElement
                            required
                            control={control}
                            name="whisper_model"
                            label="Whisper Model"
                            options={WHISPER_MODELS}
                        />
                        <Stack>
                            <CheckboxElement
                                control={control}
                                name="identify_speakers"
                                label="Speaker Recognition"
                            />
                            <Collapse
                                sx={{ ml: 4 }}
                                in={identifySpeakers}
                            >
                                <TextFieldElement
                                    fullWidth
                                    control={control}
                                    type="number"
                                    name="num_speakers"
                                    label="Number of Speakers"
                                    inputProps={{ min: 2, max: 8 }}
                                    sx={{ mb: 3, mt: 2 }}
                                />
                                <RadioButtonGroup
                                    control={control}
                                    options={NEMO_CONFIGS}
                                    name="nemo_config"
                                    label="Conversation Setting"
                                />
                            </Collapse>
                        </Stack>
                        <CheckboxElement
                            control={control}
                            name="email_notification"
                            label="Email notification"
                            helperText="Once the transcription is finished you will be notified via Email."
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        color="success"
                        type="submit"
                        disabled={isSubmitting}
                        startIcon={
                            isSubmitting ?
                                <CircularProgress
                                    color="inherit"
                                    size={20}
                                /> :
                                <EditNoteIcon />
                        }
                    >
                        Transcribe
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}