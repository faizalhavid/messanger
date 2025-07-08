import { logger } from '@messanger/utils/src/loggers';
import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { ZodError } from 'zod';

export const errorHandler = (err: unknown, c: Context) => {
  logger.error(typeof err === 'object' && err !== null && 'message' in err ? (err as any).message : String(err));

  if (err instanceof HTTPException) {
    c.status(err.status);
    return c.json({
      status: err.status,
      errors: [err.message || 'Internal Server Error'],
    });
  }

  // Handle ZodError or Zod-like error
  if (err instanceof ZodError || (err && typeof err === 'object' && 'errors' in err && Array.isArray((err as any).errors))) {
    c.status(400);
    return c.json({
      status: 400,
      message: 'Validation Error',
      errors: (err as any).errors.map((e: any) => ({
        fields: e.path,
        message: e.message,
        code: e.code,
      })),
    });
  }

  return c.json(
    {
      status: 500,
      message: typeof err === 'object' && err !== null && 'message' in err && typeof (err as any).message === 'string' ? (err as any).message : 'Internal Server Error',
    },
    500
  );
};
