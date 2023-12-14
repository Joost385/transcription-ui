import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import useCollectionQuery from "../hooks/useCollectionQuery";
import { apiFetch } from "../utils/api";
import { downloadFromUrl } from "../utils/download";
import { getTempToken } from "../utils/security";
import { Recording } from "./Recording";

export const WHISPER_MODELS = [
    { label: "Tiny", id: "tiny" },
    { label: "Base", id: "base" },
    { label: "Small", id: "small" },
    { label: "Medium", id: "medium" },
    { label: "Large", id: "large" },
    { label: "Tiny (English)", id: "tiny.en" },
    { label: "Base (English)", id: "base.en" },
    { label: "Small (English)", id: "small.en" },
    { label: "Medium (English)", id: "medium.en" },
];

export const NEMO_CONFIGS = [
    { label: "General", id: "GENERAL" },
    { label: "Meeting", id: "MEETING" },
    { label: "Telephone", id: "TELEPHONIC" },
];

export enum TranscriptionState {
    Pending = "PENDING",
    Running = "RUNNING",
    Success = "SUCCESS",
    Failure = "FAILURE",
}

export interface Transcription {
    id: number;
    recording: Recording;
    state: TranscriptionState;
    started_at: string | null;
    finished_at: string | null;
    identify_speakers: boolean;
    email_notification: boolean;
    whisper_model: string;
    nemo_config: string | null;
    num_speakers: number | null;
    language: string | null;
}

export interface TranscriptionProgress {
    state: TranscriptionState;
    took: number | null;
}

export interface TranscriptionEdit {
    recording_id?: number;
    identify_speakers: boolean;
    email_notification: boolean;
    whisper_model: string;
    nemo_config?: string;
    num_speakers?: number;
}

export const transcriptionDefaultValues: TranscriptionEdit = {
    identify_speakers: false,
    email_notification: false,
    whisper_model: "",
    nemo_config: undefined,
    num_speakers: undefined,
}

export interface Transcript {
    text: string;
    language: string;
    num_speakers: number | null;
    speaker_segments: SpeakerSegment[] | null;
}

export interface SpeakerSegment {
    text: string;
    speaker: string;
    start: number;
    end: number;
}

export const transcriptionsEqual = (a: Transcription, b: Transcription) => a.id === b.id

export const useTranscriptions = (recordingId: string | number | null = null) => {
    return useCollectionQuery<Transcription>(
        `transcriptions${recordingId ? `?recording_id=${recordingId}` : ""}`,
        transcriptionsEqual,
        { queryKey: ["transcriptions", "collection", recordingId] }
    );
};

export const useDeleteTranscription = ({
    onSuccess,
    onError,
}: {
    onSuccess?: () => void,
    onError?: () => void,
} = {}) => {
    return useMutation({
        mutationFn: async ({ id }: Transcription) => {
            const response = await apiFetch(`transcriptions/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error(`Failed to delete transcription ${id}`);
            }
        },
        onSuccess,
        onError,
    });
}

export const useDeleteTranscriptions = ({
    onSuccess,
    onError,
}: {
    onSuccess?: () => void,
    onError?: () => void,
} = {}) => {
    return useMutation({
        mutationFn: async (transcriptions: Transcription[]) => {
            await Promise.all(
                transcriptions.map(({ id }) =>
                    apiFetch(`transcriptions/${id}`, { method: "DELETE" })
                )
            );
        },
        onSuccess,
        onError,
    });
}

export const useTerminateAllTranscriptions = ({
    onSuccess,
    onError,
}: {
    onSuccess?: () => void,
    onError?: () => void,
} = {}) => {
    return useMutation({
        mutationFn: async () => {
            const response = await apiFetch("transcriptions/terminate_all");

            if (!response.ok) {
                throw new Error("Failed to terminate all transcriptions");
            }
        },
        onSuccess,
        onError,
    });
}

export const useTranscript = (transcription?: Transcription, enabled: boolean = true) => {
    return useQuery<Transcript>({
        enabled: !!transcription && enabled,
        queryKey: ["transcriptions", "transcript", transcription?.id],
        queryFn: async () => {
            const response = await apiFetch(`transcriptions/${transcription?.id}/transcript`);

            if (response.ok) {
                return await response.json();
            }

            return null;
        },
    });
}

export const useTranscriptionProgress = ({
    transcription,
    refetchInterval,
    onChange,
}: {
    transcription: Transcription;
    refetchInterval: number;
    onChange?: (state: TranscriptionState) => void;
}) => {
    const shouldPoll = (state: TranscriptionState) => {
        return state !== TranscriptionState.Success
            && state !== TranscriptionState.Failure;
    }

    const getTook = (transcription: Transcription) => {
        if (transcription.started_at && transcription.finished_at) {
            const startedAt = new Date(transcription.started_at);
            const finishedAt = new Date(transcription.finished_at);
            const delta = finishedAt.getTime() - startedAt.getTime();
            return Math.floor(delta / 1000);
        }

        return null;
    };


    const [isPolling, setIsPolling] = useState<boolean>(shouldPoll(transcription.state));

    const progress = useQuery<TranscriptionProgress>({
        queryFn: async () => {
            const response = await apiFetch(`transcriptions/${transcription.id}/progress`);

            if (!response.ok) {
                throw new Error("Error while fetching transcription progress.");
            }

            return await response.json();
        },
        queryKey: ["transcriptions", "state", transcription.id],
        initialData: {
            state: transcription.state,
            took: getTook(transcription),
        },
        refetchInterval,
        enabled: isPolling,
    });

    useEffect(() => {
        if (progress.isSuccess) {
            onChange?.(progress.data.state);
            setIsPolling(shouldPoll(progress.data.state));
        }
    }, [progress.data]);

    return progress.data;
}

export const downloadTranscript = async (transcription: Transcription, format: string) => {
    const token = await getTempToken();
    const url = `api/transcriptions/${transcription.id}/transcript/export?format=${format}&token=${token}`;
    downloadFromUrl(url);
}

export const getWhisperModelLabel = (whisperModel: string) => {
    const model = WHISPER_MODELS.find(({ id }) => id == whisperModel);
    return model?.label;
}

export const getNemoConfigLabel = (nemoConfig: string) => {
    const config = NEMO_CONFIGS.find(({ id }) => id == nemoConfig);
    return config?.label;
}