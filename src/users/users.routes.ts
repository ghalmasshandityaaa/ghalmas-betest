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
  }

  getRouter() {
    return this.router;
  }
}

export default new UserRouter().getRouter();
