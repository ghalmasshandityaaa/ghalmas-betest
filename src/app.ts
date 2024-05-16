import cookies from 'cookie-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';

import { handleError } from '~/shared/middlewares/handle-error.middleware';
import { notFound } from '~/shared/middlewares/not-found.middleware';
import { logger } from '~/shared/utils/logger';

import apiRoutes from './api.routes';

function configureCors(app: Express): void {
  const ACL: string[] = [
    //TODO: Add allowed origins
    // "http://localhost:3001", // front end server
  ];

  app.use(
    cors({
      origin: ACL,
      credentials: true,
    }),
  );
}

function configureSecurityHeaders(app: Express): void {
  // Security Headers
  app.use(helmet());
}

function configureBodyParsing(app: Express): void {
  // Body Parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
}

function configureCookieParsing(app: Express): void {
  // Cookie Parsing
  app.use(cookies());
}

function configureLogger(app: Express): void {
  // Logger
  app.use(logger());
}

function configureRoutes(app: Express): void {
  // Routes
  app.use('/api', apiRoutes);
}

function configureErrorHandling(app: Express): void {
  // Error handler
  app.use(notFound);
  app.use(handleError);
}

export function createApp(): Express {
  const app = express();

  configureCors(app);
  configureSecurityHeaders(app);
  configureBodyParsing(app);
  configureCookieParsing(app);
  configureLogger(app);
  configureRoutes(app);
  configureErrorHandling(app);

  return app;
}
