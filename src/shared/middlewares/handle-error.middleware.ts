import type { NextFunction, Request, Response } from 'express';
import { HttpError } from 'http-errors';
import status from 'http-status';
import { match } from 'ts-pattern';
import { ZodError } from 'zod';

import { isProduction } from '~/env';

type HandledError = {
  ok: boolean;
  status: number;
} & Record<string, any>;

function handleHttpError(err: HttpError): HandledError {
  return {
    ok: false,
    status: err.status,
    message: err.message,
  };
}

function handleZodError(err: ZodError): HandledError {
  return {
    ok: false,
    status: status.BAD_REQUEST,
    issues: err.issues,
  };
}

/**
 * Handles errors and sends an appropriate response based on the error type.
 *
 * @param {Error} err - The error object to be handled
 * @param {Request} _req - The request object
 * @param {Response} res - The response object
 * @param {NextFunction} _next - The next function
 * @return {Promise<any>} Returns a Promise that resolves when the response is sent
 */
export async function handleError(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): Promise<any> {
  const error = match(err)
    .when(err => err instanceof HttpError, handleHttpError)
    .when(err => err instanceof ZodError, handleZodError)
    .otherwise(err => ({
      ok: false,
      status: status.INTERNAL_SERVER_ERROR,
      message: isProduction ? 'INTERNAL ERROR' : err.message,
    }));

  return res.status(error.status).send(error);
}
