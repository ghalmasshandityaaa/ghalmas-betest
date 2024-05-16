import { Router } from 'express';

import { verifySession } from '~/auth/auth.middleware';
import { asyncHandler } from '~/shared/utils/lib/express/handler';

import UserController from './users.controller';

class UserRouter {
  private router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get('/me', verifySession, asyncHandler(UserController.me));
    this.router.get(
      '/identity/:identityNumber',
      verifySession,
      asyncHandler(UserController.getByIdentityNumber),
    );
    this.router.get(
      '/account/:accountNumber',
      verifySession,
      asyncHandler(UserController.getByAccountNumber),
    );
  }

  getRouter() {
    return this.router;
  }
}

export default new UserRouter().getRouter();
