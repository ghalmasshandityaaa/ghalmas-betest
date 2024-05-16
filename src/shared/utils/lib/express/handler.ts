import type { NextFunction, Request, Response } from 'express';

/**
 * Async handler function that wraps the responseHandler function in a try-catch block.
 *
 * @param {Function} responseHandler - The function to handle the response asynchronously.
 * @return {Function} A function that handles the request, response, and next function asynchronously.
 */
export function asyncHandler(responseHandler: Function) {
  return async function handle(req: Request, res: Response, next: NextFunction) {
    try {
      await responseHandler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}
