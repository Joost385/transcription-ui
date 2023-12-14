import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../utils/api";

export interface TranscriptionStats {
    max_transcriptions: number;
    n_pending: number;
    n_running: number;
}

export const useTranscriptionStats = () => {
    return useQuery<TranscriptionStats>({
        refetchInterval: 5000,
        queryKey: ["transcription_stats"],
        queryFn: async () => {
            const response = await apiFetch("/monitoring/transcriptions");

            if (!response.ok) {
                throw new Error("An error occurred while fetching transcription statistics.");
            }

            return await response.json();
        },
    });
}