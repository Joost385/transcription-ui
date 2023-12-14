import { useMutation, useQuery } from "@tanstack/react-query";
import useCollectionQuery from "../hooks/useCollectionQuery";
import { apiFetch } from "../utils/api";

export interface User {
    id: number;
    email: string;
    firstname: string;
    lastname: string;
    admin: boolean;
    active: boolean;
}

export interface UserEdit {
    email: string;
    firstname: string;
    lastname: string;
    admin: boolean;
    active: boolean;
}

export const userDefaultValues: UserEdit = {
    admin: false,
    active: true,
    email: "",
    firstname: "",
    lastname: "",
}

export const useUsers = () => {
    return useCollectionQuery<User>(
        "users",
        (a: User, b: User) => a.id === b.id,
        { queryKey: ["users", "collection"] }
    );
}

export const useDeleteUser = ({
    onSuccess,
    onError,
}: {
    onSuccess?: () => void,
    onError?: () => void,
} = {}) => {
    return useMutation({
        mutationFn: async (user: User) => {
            const response = await apiFetch(`users/${user.id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete user");
            }
        },
        onSuccess,
        onError,
    });
}

export const useToggleUserActive = ({
    onSuccess,
    onError,
}: {
    onSuccess?: () => void,
    onError?: () => void,
} = {}) => {
    return useMutation({
        mutationFn: async (user: User) => {
            const response = await apiFetch(`users/${user.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ active: !user.active }),
            });

            if (!response.ok) {
                throw new Error("Failed to toggle user.active");
            }
        },
        onSuccess,
        onError,
    });
}

export async function getCurrentUser(): Promise<User | null> {
    const response = await apiFetch("users/me");

    if (!response.ok) {
        return null;
    }

    return response.json();
}

export const useContactEmail = () => {
    return useQuery<string>({
        queryKey: ["contact_email"],
        queryFn: async () => {
            const response = await apiFetch("users/contact_email");

            if (!response.ok) {
                throw new Error("Failed to fetch contact email");
            }

            return response.json()
        }
    });
}