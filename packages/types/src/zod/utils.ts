
import { ZodError } from "zod";

export function getZodFieldErrors<T extends Record<string, any>>(error: ZodError): Partial<Record<keyof T, string>> {
    const fieldErrors: Record<string, string> = {};
    error.errors.forEach(err => {
        const field = err.path[0] as string;
        if (field) {
            fieldErrors[field] = err.message;
        }
    });
    return fieldErrors as Partial<Record<keyof T, string>>;
}