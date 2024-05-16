import type { NextFunction, Request, Response } from 'express';

import type { UserSession } from '~/auth/auth.schema';
import { handleResponse } from '~/shared/lib/result';

import usersService from './users.service';

interface IUsersController {
  me(req: Request, res: Response<{}, { session: UserSession }>, next: NextFunction): Promise<any>;
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
}

export default new UsersController();
