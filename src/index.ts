import chalk from 'chalk';
import { type Express } from 'express';
import ora from 'ora';

import { createApp } from './app';
import env from './env';
import mongo from './shared/db/mongo';
import redis from './shared/db/redis';

async function connectToDatabases(): Promise<void> {
  try {
    await mongo.connect();
    await redis.connect();
  } catch (error) {
    ora().fail(`${chalk.gray('[Database]')} Failed to connect`);
    console.error(error);
    process.exit(1);
  }
}

function startServer(app: Express): void {
  app.listen(env.PORT, env.HOST, () => {
    ora().info(
      `${chalk.gray('[Server]')} Started at ${chalk.bold(`http://${env.HOST}:${env.PORT}`)}`,
    );
  });
}

function handleUncaughtExceptions(): void {
  process.on('uncaughtException', () => {
    ora().fail(`${chalk.gray('[Server]')} Uncaught Exception`);
    process.exit(1);
  });
}

function handleGracefulShutdown(): void {
  process.on('SIGINT', () => {
    ora().info(`${chalk.gray('[Server]')} Stopped`);
    mongo.client.connection.close();
    redis.client.disconnect();

    process.exit(0);
  });
}

async function startApp(): Promise<void> {
  const app = createApp();

  await connectToDatabases();
  startServer(app);
  handleUncaughtExceptions();
  handleGracefulShutdown();
}

startApp();
