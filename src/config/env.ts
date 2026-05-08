import dotenv from 'dotenv';
dotenv.config();

const required = (key: string): string => {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
};

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: required('MONGODB_URI'),
  jwt: {
    secret: required('JWT_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    cookieExpiresIn: parseInt(process.env.JWT_COOKIE_EXPIRES_IN || '7', 10),
  },
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'CoreX Ventures <noreply@corexventures.com>',
    adminEmail: process.env.ADMIN_EMAIL || 'admin@corexventures.com',
  },
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  seed: {
    adminName: process.env.ADMIN_NAME || 'Admin',
    adminEmail: process.env.ADMIN_EMAIL_SEED || 'admin@corexventures.com',
    adminPassword: process.env.ADMIN_PASSWORD || 'Admin@123456',
  },
} as const;
