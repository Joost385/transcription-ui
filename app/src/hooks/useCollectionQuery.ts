import {
    UseQueryOptions,
    UseQueryResult,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { apiFetch } from "../utils/api";

export type CollectionQuery<T> = {
    clear: () => void;
    invalidate: () => void;
    addItem: (item: T) => void;
    removeItem: (item: T) => void;
    removeItems: (item: T[]) => void;
    replaceItem: (item: T) => void;
} & UseQueryResult<T[]>

type ItemsEqual<T> = (a: T, b: T) => boolean;

export default function useCollectionQuery<T>(
    path: string,
    itemsEqual: ItemsEqual<T>,
    options: Omit<UseQueryOptions<T[]>, "queryFn">
): CollectionQuery<T> {
    const queryClient = useQueryClient();
    const queryKey = options.queryKey ?? [];
    const query = useQuery<T[]>({
        queryFn: async () => {
            const response = await apiFetch(path);

            if (!response.ok) {
                throw new Error(`Failed to fetch ${path}`);
            }

            return response.json();
        },
        ...options
    });

    return {
        ...query,
        invalidate: () => queryClient.invalidateQueries(queryKey),
        clear: () => {
            queryClient.setQueryData(queryKey, (data?: T[]) => (
                data && []
            ));
        },
        addItem: item => {
            queryClient.setQueryData(queryKey, (data?: T[]) => (
                data ? [item, ...data] : [item]
            ));
        },
        removeItem: item => {
            queryClient.setQueryData(queryKey, (data?: T[]) => (
                data?.filter(_item => !itemsEqual(item, _item))
            ));
        },
        removeItems: items => {
            queryClient.setQueryData(queryKey, (data?: T[]) => (
                data?.filter(dataItem => !items.some(item => itemsEqual(item, dataItem)))
            ));
        },
        replaceItem: item => {
            queryClient.setQueryData(queryKey, (data?: T[]) => (
                data?.map(_item => itemsEqual(item, _item) ? item : _item)
            ));
        },
    }
}
