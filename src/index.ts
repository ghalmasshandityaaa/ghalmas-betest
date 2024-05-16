import chalk from 'chalk';
import { type Express } from 'express';
import ora from 'ora';

import { createApp } from './app';
import env from './env';
import mongo from './shared/db/mongo';
import redis from './shared/db/redis';

/**
 * Asynchronously connects to MongoDB and Redis databases.
 *
 * @return {Promise<void>} A Promise that resolves when the databases are successfully connected or exits the process with an error message if there is a connection failure.
 */
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

/**
 * Starts the server by listening on the specified host and port.
 *
 * @param {Express} app - The Express application instance.
 * @return {void} No return value.
 */
function startServer(app: Express): void {
  const PORT = env.PORT || 3000;
  app.listen(PORT, () => {
    ora().info(`${chalk.gray('[Server]')} Started at ${chalk.bold(`http://${env.HOST}:${PORT}`)}`);
  });
}

/**
 * Handles uncaught exceptions by exiting the process with an error message.
 *
 * @return {void} No return value.
 */
function handleUncaughtExceptions(): void {
  process.on('uncaughtException', () => {
    ora().fail(`${chalk.gray('[Server]')} Uncaught Exception`);
    process.exit(1);
  });
}

/**
 * Handles a graceful shutdown of the server when receiving a SIGINT signal.
 *
 * @return {void} No return value.
 */
function handleGracefulShutdown(): void {
  process.on('SIGINT', () => {
    ora().info(`${chalk.gray('[Server]')} Stopped`);
    mongo.client.connection.close();
    redis.client.disconnect();

    process.exit(0);
  });
}

/**
 * Asynchronously starts the application by creating the app, connecting to databases, starting the server, handling uncaught exceptions, and handling a graceful shutdown.
 *
 * @return {Promise<void>} A Promise that resolves once the application has been successfully started.
 */
async function startApp(): Promise<void> {
  const app = createApp();

  await connectToDatabases();
  startServer(app);
  handleUncaughtExceptions();
  handleGracefulShutdown();
}

startApp();
