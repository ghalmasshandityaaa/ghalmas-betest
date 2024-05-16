import { Router } from 'express';

import authRoutes from './auth/auth.routes';
import usersRoutes from './users/users.routes';

class ApiRouter {
  private router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.use('/users', usersRoutes);
    this.router.use('/auth', authRoutes);
  }

  getRouter() {
    return this.router;
  }
}

export default new ApiRouter().getRouter();
