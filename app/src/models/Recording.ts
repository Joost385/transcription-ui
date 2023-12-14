import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useCollectionQuery from "../hooks/useCollectionQuery";
import useSecurityStore from "../state/useSecurityStore";
import useUploadStore from "../state/useUploadStore";
import { apiFetch } from "../utils/api";
import { downloadFromUrl } from "../utils/download";
import { getTempToken } from "../utils/security";

export interface Recording {
    id: number;
    created_at: string;
    name: string;
    size: number;
    duration: number;
}

export const recordingsEqual = (a: Recording, b: Recording) => a.id === b.id

export const useRecordings = (enabled: boolean = true) => {
    return useCollectionQuery<Recording>(
        "recordings",
        recordingsEqual,
        {
            enabled,
            queryKey: ["recordings", "collection"],
        }
    );
}

export const useRecording = (recordingId: string | number | null = null) => {
    return useQuery<Recording>({
        enabled: !!recordingId,
        queryKey: ["recordings", "item", recordingId],
        queryFn: async () => {
            const response = await apiFetch(`recordings/${recordingId}`);

            if (!response.ok) {
                if (response.status === 404) {
                    return null;
                }

                throw new Error(`Failed to get recording ${recordingId}`);
            }

            return response.json();
        },
    });
}

export const useDeleteRecording = ({
    onSuccess,
    onError,
}: {
    onSuccess?: () => void,
    onError?: () => void,
} = {}) => {
    return useMutation({
        mutationFn: async (recording: Recording) => {
            const response = await apiFetch(`recordings/${recording.id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error(`Failed to delete recording ${recording.id}`);
            }
        },
        onSuccess,
        onError,
    });
}

export const useDeleteRecordings = ({
    onSuccess,
    onError,
}: {
    onSuccess?: () => void,
    onError?: () => void,
} = {}) => {
    return useMutation({
        mutationFn: async (recordings: Recording[]) => {
            await Promise.all(
                recordings.map(recording =>
                    apiFetch(`recordings/${recording.id}`, { method: "DELETE" })
                )
            );
        },
        onSuccess,
        onError,
    });
}

export const useRecordingUpload = () => {
    const queryClient = useQueryClient();
    const token = useSecurityStore(state => state.token);
    const addUpload = useUploadStore(state => state.addUpload);
    const removeUpload = useUploadStore(state => state.removeUpload);
    const setUploadStatus = useUploadStore(state => state.setUploadStatus);
    const setUploadProgress = useUploadStore(state => state.setUploadProgress);

    return (file: File) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "api/recordings/upload");
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);

        const abort = xhr.abort.bind(xhr);
        const upload = addUpload(file.name, abort);

        xhr.upload.onprogress = e => {
            if (e.lengthComputable) {
                const progress = Math.round((e.loaded / e.total) * 100);
                setUploadProgress(upload.id, progress);
            } else {
                setUploadProgress(upload.id, undefined);
            }
        }

        xhr.onerror = () => setUploadStatus(upload.id, "error");

        xhr.onload = () => {
            if (xhr.status !== 200) {
                setUploadStatus(upload.id, "error");
            } else {
                setUploadStatus(upload.id, "success");
                setTimeout(() => removeUpload(upload.id), 5000);
                queryClient.invalidateQueries(["recordings", "collection"]);
            }
        }

        const formData = new FormData();
        formData.append("file", file);
        xhr.send(formData);
    }
}

export const getRecordingDownloadUrl = async (recording: Recording, start?: number, end?: number) => {
    const token = await getTempToken();

    const params = new URLSearchParams({ token: token });

    if (start !== undefined) {
        params.append("start", start.toString());
    };
    if (end !== undefined) {
        params.append("end", end.toString());
    };

    return `api/recordings/${recording.id}/download?${params.toString()}`;
};


export const downloadRecording = async (recording: Recording) => {
    const url = await getRecordingDownloadUrl(recording);
    downloadFromUrl(url);
}