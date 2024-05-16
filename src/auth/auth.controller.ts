import type { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';

import env from '~/env';
import { handleResponse } from '~/shared/lib/result';

import type { SignInSchema, SignUpSchema } from './auth.schema';
import authService from './auth.service';

class AuthController {
  async signIn(req: Request<{}, {}, SignInSchema>, res: Response, next: NextFunction) {
    try {
      const { accessToken, refreshToken } = await authService.signIn(req.body);

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

  async signUp(req: Request<{}, {}, SignUpSchema>, res: Response, next: NextFunction) {
    try {
      await authService.signUp(req.body);

      return res.send(handleResponse());
    } catch (err) {
      return next(err);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    const token: string | undefined = req.cookies['X-JWT-REFRESH'];
    try {
      const { accessToken, refreshToken } = await authService.refresh(token);

      return res
        .cookie('X-JWT-REFRESH', refreshToken, {
          secure: true,
          httpOnly: true,
          maxAge: env.REFRESH_TOKEN_TTL,
        })
        .send(handleResponse({ accessToken }));
    } catch (err) {
      res.clearCookie('X-JWT-REFRESH');
      return next(err);
    }
  }

  async signOut(req: Request, res: Response, next: NextFunction) {
    const refreshToken: string | undefined = req.cookies['X-JWT-REFRESH'];
    try {
      await authService.signOut(refreshToken);

      res.clearCookie('X-JWT-REFRESH');
      res.status(httpStatus.OK).send(handleResponse());
    } catch (err) {
      return next(err);
    }
  }
}

export default new AuthController();
