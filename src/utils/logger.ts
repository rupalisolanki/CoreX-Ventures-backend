import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

const logDir = path.join(process.cwd(), 'logs');

const fmt = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const rotateOpts = (filename: string): DailyRotateFile.DailyRotateFileTransportOptions => ({
  dirname: logDir,
  filename: `${filename}-%DATE%.log`,
  datePattern: 'YYYY-MM-DD',
  maxSize: '5m',
  maxFiles: '14d',
  zippedArchive: true,
});

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: fmt,
  transports: [
    new DailyRotateFile({ ...rotateOpts('error'), level: 'error' }),
    new DailyRotateFile(rotateOpts('combined')),
  ],
  exceptionHandlers: [
    new DailyRotateFile(rotateOpts('exceptions')),
  ],
  rejectionHandlers: [
    new DailyRotateFile(rotateOpts('rejections')),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }));
}
