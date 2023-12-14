import { UseFormSetError } from "react-hook-form";

// Taken from: https://emailregex.com/index.html
const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i;

export interface ValidationErrors {
    detail: ValidationError[];
}

export interface ValidationError {
    type: string;
    msg: string;
    loc: string[];
}

export function isValidEmail(value: any): true | string {
    return (
        !value
        || typeof value !== "string"
        || EMAIL_REGEX.test(value)
        || "Please enter a valid email address."
    );
}

export function setFormErrors(validationErrors: ValidationErrors, setError: UseFormSetError<any>) {
    for (const validationError of validationErrors.detail) {
        const path = validationError.loc.slice(1).join(".") as any;
        setError(path, { message: validationError.msg });
    }
}