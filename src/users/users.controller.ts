import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';

import type { UserSession } from '~/auth/auth.schema';
import { handleResponse } from '~/shared/lib/result';

import usersService from './users.service';

interface IUsersController {
  me(req: Request, res: Response<{}, { session: UserSession }>, next: NextFunction): Promise<any>;
  getByIdentityNumber(req: Request, res: Response<{}, {}>, next: NextFunction): Promise<any>;
  getByAccountNumber(req: Request, res: Response<{}, {}>, next: NextFunction): Promise<any>;
}
class UsersController implements IUsersController {
  async me(_req: Request, res: Response<{}, { session: UserSession }>, next: NextFunction) {
    try {
      const user = await usersService.getById(res.locals.session.userId);

      return res.send(handleResponse({ user }));
    } catch (err) {
      return next(err);
    }
  }

  async getByIdentityNumber(req: Request, res: Response<{}, {}>, next: NextFunction): Promise<any> {
    try {
      const user = await usersService.getByIdentityNumber(req.params.identityNumber);

      return res.send(handleResponse({ user }));
    } catch (err) {
      return next(err);
    }
  }

  async getByAccountNumber(req: Request, res: Response<{}, {}>, next: NextFunction): Promise<any> {
    try {
      const user = await usersService.getByAccountNumber(req.params.accountNumber);

      return res.send(handleResponse({ user }));
    } catch (err) {
      return next(err);
    }
  }
}

export default new UsersController();
