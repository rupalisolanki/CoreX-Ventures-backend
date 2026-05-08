import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { config } from '../config/env';
import { User } from '../models/User';
import { logger } from './logger';

const seed = async (): Promise<void> => {
  await mongoose.connect(config.mongoUri);
  logger.info('Connected to MongoDB for seeding');

  const existing = await User.findOne({ email: config.seed.adminEmail });
  if (existing) {
    logger.info('Admin user already exists, skipping seed');
    process.exit(0);
  }

  await User.create({
    name: config.seed.adminName,
    email: config.seed.adminEmail,
    password: config.seed.adminPassword,
    role: 'admin',
    isActive: true,
  });

  logger.info(`Admin user created: ${config.seed.adminEmail}`);
  process.exit(0);
};

seed().catch(err => {
  logger.error('Seed failed', err);
  process.exit(1);
});
