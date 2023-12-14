import { useQuery } from "@tanstack/react-query";
import { get } from "lodash-es";
import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";

export interface SystemStats {
    cpu: number;
    gpu: number | null;
    vram: number | null;
    memory: {
        total: number;
        available: number;
        used: number;
        used_percent: number;
    };
}

export const useSystemStats = () => {
    return useQuery<SystemStats>({
        refetchInterval: 1000,
        queryKey: ["system_stats"],
        queryFn: async () => {
            const response = await apiFetch("/monitoring/system");

            if (!response.ok) {
                throw new Error("An error occurred while fetching system statistics.");
            }

            return await response.json();
        },
    });
}

export const useSystemStat = (path: string, windowLength: number = 150) => {
    const systemStats = useSystemStats();
    const [data, setData] = useState<number[] | null>(new Array(windowLength).fill(0));

    useEffect(() => {
        if (systemStats.isSuccess) {
            const value = get(systemStats.data, path) as number | null

            if (value === null) {
                setData(null);
            } else {
                setData(prev => !prev ?
                    [value] :
                    [...prev.slice(1, prev.length), value],
                );
            }
        }
    }, [systemStats.data]);

    return data;
}
