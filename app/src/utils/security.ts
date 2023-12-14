import useSecurityStore from "../state/useSecurityStore";
import { apiFetch } from "./api";

export interface LoginData {
    username: string;
    password: string;
}

export interface TokenResponse {
    access_token: string;
    token_type: string;
}

export interface ErrorResponse {
    detail: string;
}

export async function login(loginData: LoginData) {
    const params = new URLSearchParams();
    params.append("username", loginData.username);
    params.append("password", loginData.password);
    const response = await apiFetch("security/token", {
        method: "POST",
        body: params,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    const data = await response.json();

    if (response.ok) {
        const { access_token } = data as TokenResponse;
        useSecurityStore.getState().setToken(access_token);
        useSecurityStore.getState().loadUser();
    } else {
        const { detail } = data as ErrorResponse;
        throw new Error(detail);
    }
}

export function logout() {
    useSecurityStore.getState().setToken(null);
    useSecurityStore.getState().setUser(null);
}

export async function getTempToken(): Promise<string> {
    const response = await apiFetch("security/temp_token");

    if (!response.ok) {
        throw new Error("Error while fetching temporary token");
    }

    const data = await response.json();
    const { access_token } = data as TokenResponse;

    return access_token;
}