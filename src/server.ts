import { config } from './config/env';
import { connectDB } from './config/database';
import { logger } from './utils/logger';
import app from './app';
import fs from 'fs';

// Ensure uploads dir exists
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

const start = async (): Promise<void> => {
  await connectDB();
  app.listen(config.port, () => {
    logger.info(`CoreX Ventures API running on port ${config.port} [${config.env}]`);
  });
};

process.on('unhandledRejection', (err: Error) => {
  logger.error('Unhandled rejection', err);
  process.exit(1);
});

process.on('uncaughtException', (err: Error) => {
  logger.error('Uncaught exception', err);
  process.exit(1);
});

start();
