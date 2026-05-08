import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import path from 'path';

import { config } from './config/env';
import { globalErrorHandler, AppError } from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import contactRoutes from './routes/contactRoutes';
import inquiryRoutes from './routes/inquiryRoutes';
import newsletterRoutes from './routes/newsletterRoutes';
import healthRoutes from "./routes/healthRoutes";


const app = express();

//health check route
app.use('/api/v1/health', healthRoutes);

// Security
app.use(helmet());
app.use(compression());
app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(mongoSanitize());
app.use(hpp());

// Rate limiting
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: 'Too many requests' }));
app.use('/api/contacts', rateLimit({ windowMs: 60 * 60 * 1000, max: 10 }));
app.use('/api/inquiries', rateLimit({ windowMs: 60 * 60 * 1000, max: 5 }));

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Logging
if (config.env !== 'test') app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));

// Static uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/contacts', contactRoutes);
app.use('/api/v1/inquiries', inquiryRoutes);
app.use('/api/v1/newsletter', newsletterRoutes);

app.get('/api/v1/health', (_req, res) => res.json({ success: true, message: 'CoreX Ventures API running' }));

// 404
app.all('*', (req, _res, next) => next(new AppError(`Route ${req.originalUrl} not found`, 404)));

// Error handler
app.use(globalErrorHandler);

export default app;
