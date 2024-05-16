import { Router } from 'express';

import { validateInput } from '~/shared/middlewares/validate-input';
import { asyncHandler } from '~/shared/utils/lib/express/handler';

import AuthController from './auth.controller';
import { SignInDTOSchema, SignUpDTOSchema } from './auth.schema';

class AuthRouter {
  private router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post(
      '/sign-in',
      validateInput({ body: SignInDTOSchema }),
      asyncHandler(AuthController.signIn),
    );

    this.router.post(
      '/sign-up',
      validateInput({ body: SignUpDTOSchema }),
      asyncHandler(AuthController.signUp),
    );

    this.router.post('/refresh', asyncHandler(AuthController.refresh));
    this.router.post('/sign-out', asyncHandler(AuthController.signOut)); // Fixed the endpoint to "/sign-out"
  }

  getRouter() {
    return this.router;
  }
}

export default new AuthRouter().getRouter();
