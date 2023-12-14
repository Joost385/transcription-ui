import { create } from "zustand";
import { Transcription } from "../models/Transcription";

interface TranscriptState {
    isOpen: boolean;
    transcription?: Transcription;
    handleOpen: (transcription: Transcription) => void;
    handleClose: () => void;
}

const defaultState = {
    isOpen: false,
    transcription: undefined,
}

const useTranscriptStore = create<TranscriptState>()(
    set => ({
        ...defaultState,
        handleClose: () => set({ isOpen: false }),
        handleOpen: transcription => set({
            ...defaultState,
            transcription,
            isOpen: true,
        }),
    })
);

export default useTranscriptStore;