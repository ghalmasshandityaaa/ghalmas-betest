import type { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';

import env from '~/env';
import { handleResponse } from '~/shared/lib/result';

import type { SignInSchema, SignUpSchema } from './auth.schema';
import authService from './auth.service';

interface IAuthController {
  signIn(req: Request<{}, {}, SignInSchema>, res: Response, next: NextFunction): Promise<any>;
  signUp(req: Request<{}, {}, SignUpSchema>, res: Response, next: NextFunction): Promise<any>;
  refresh(req: Request, res: Response, next: NextFunction): Promise<any>;
  signOut(req: Request, res: Response, next: NextFunction): Promise<any>;
}

class AuthController implements IAuthController {
  /**
   * Handles user sign-in by validating credentials and issuing JWT tokens.
   *
   * @param {Request<{}, {}, SignInSchema>} req - The request object containing the sign-in data.
   * @param {Response} res - The response object to send the result.
   * @param {NextFunction} next - The next middleware function in the stack.
   * @return {Promise<any>} Promise resolving with the response containing the access token.
   */
  async signIn(
    req: Request<{}, {}, SignInSchema>,
    res: Response,
    next: NextFunction,
  ): Promise<any> {
    try {
      const { accessToken, refreshToken } = await authService.signIn(req.body);

      // Set the refresh token as a secure, HTTP-only cookie
      return res
        .cookie('X-JWT-REFRESH', refreshToken, {
          secure: true,
          httpOnly: true,
          maxAge: env.REFRESH_TOKEN_TTL,
        })
        .send(handleResponse({ accessToken }));
    } catch (err) {
      return next(err);
    }
  }

  /**
   * Handles user sign-up by creating a new user in the database.
   *
   * @param {Request<{}, {}, SignUpSchema>} req - The request object containing the sign-up data.
   * @param {Response} res - The response object to send the result.
   * @param {NextFunction} next - The next middleware function in the stack.
   * @return {Promise<any>} Promise resolving with the response indicating success.
   */
  async signUp(
    req: Request<{}, {}, SignUpSchema>,
    res: Response,
    next: NextFunction,
  ): Promise<any> {
    try {
      await authService.signUp(req.body);

      // Send a response indicating success
      return res.send(handleResponse());
    } catch (err) {
      return next(err);
    }
  }

  /**
   * Asynchronously refreshes the access token using the provided refresh token.
   *
   * @param {Request} req - The request object containing the refresh token cookie.
   * @param {Response} res - The response object to send the new tokens.
   * @param {NextFunction} next - The next middleware function in the stack.
   * @return {Promise<any>} Promise that resolves after refreshing the tokens.
   */
  async refresh(req: Request, res: Response, next: NextFunction): Promise<any> {
    const token: string | undefined = req.cookies['X-JWT-REFRESH'];
    try {
      const { accessToken, refreshToken } = await authService.refresh(token);

      // Set the new refresh token as a secure, HTTP-only cookie
      return res
        .cookie('X-JWT-REFRESH', refreshToken, {
          secure: true,
          httpOnly: true,
          maxAge: env.REFRESH_TOKEN_TTL,
        })
        .send(handleResponse({ accessToken }));
    } catch (err) {
      // Clear the refresh token cookie if there's an error
      res.clearCookie('X-JWT-REFRESH');
      return next(err);
    }
  }

  /**
   * Handles user sign-out by clearing the session and deleting the refresh token.
   *
   * @param {Request} req - The request object containing the refresh token cookie.
   * @param {Response} res - The response object to send the result.
   * @param {NextFunction} next - The next middleware function in the stack.
   * @return {Promise<any>} Promise resolving with the response indicating success.
   */
  async signOut(req: Request, res: Response, next: NextFunction): Promise<any> {
    const refreshToken: string | undefined = req.cookies['X-JWT-REFRESH'];
    try {
      await authService.signOut(refreshToken);

      // Clear the refresh token cookie
      res.clearCookie('X-JWT-REFRESH');
      res.status(httpStatus.OK).send(handleResponse());
    } catch (err) {
      return next(err);
    }
  }
}

export default new AuthController();
