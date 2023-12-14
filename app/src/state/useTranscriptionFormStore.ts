import { create } from "zustand";
import { Recording } from "../models/Recording";
import { Transcription } from "../models/Transcription";

type TranscriptionCallback = (transcription: Transcription) => void;

interface TranscriptionFormState {
    isOpen: boolean;
    recording?: Recording;
    onSuccess?: TranscriptionCallback;
    handleOpen: ({
        recording,
        onSuccess,
    }: {
        recording?: Recording;
        onSuccess?: TranscriptionCallback;
    }) => void;
    handleClose: () => void;
}

const defaultState = {
    isOpen: false,
    recording: undefined,
    onSuccess: undefined,
}

const useTranscriptionFormStore = create<TranscriptionFormState>()(
    set => ({
        ...defaultState,
        handleClose: () => set({ isOpen: false }),
        handleOpen: options => set({
            ...defaultState,
            ...options,
            isOpen: true,
        }),
    })
);

export default useTranscriptionFormStore;