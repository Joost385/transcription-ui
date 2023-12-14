import urlJoin from "url-join";
import useSecurityStore from "../state/useSecurityStore";
import { logout } from "./security";

export enum HttpStatus {
    Unauthorized = 401,
    UnprocessableEntity = 422,
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
    const baseURL = (new URL(location.href)).origin;
    const url = urlJoin(baseURL, "api", path);
    const token = useSecurityStore.getState().token;
    const response = await fetch(url, {
        ...init,
        headers: {
            ...init?.headers,
            "Authorization": `Bearer ${token}`,
        }
    });

    if (response.status === HttpStatus.Unauthorized) {
        logout();
    }

    return response;
}
