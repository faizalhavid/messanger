import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { ZodError } from 'zod';

export const errorHandler = (err: unknown, c: Context) => {
    if (err instanceof HTTPException) {
        c.status(err.status)
        return c.json({
            status: err.status,
            errors: [err.message || 'Internal Server Error'],
        });
    }

    if (err instanceof ZodError) {
        c.status(400);
        return c.json({
            status: 400,
            message: 'Validation Error',
            errors: err.errors.map(e => ({
                fields: e.path,
                message: e.message,
                code: e.code
            }))
        });
    }

    return c.json({
        status: 500,
        message: (typeof err === 'object' && err !== null && 'message' in err && typeof (err as any).message === 'string')
            ? (err as any).message
            : 'Internal Server Error'
    }, 500);
};