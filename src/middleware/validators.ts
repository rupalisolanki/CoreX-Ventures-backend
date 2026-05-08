import { body, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export const validate = (req: Request, _res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const msg = errors.array().map(e => e.msg).join('. ');
    return next(new AppError(msg, 400));
  }
  next();
};

const DIVISIONS = ['infra', 'exports', 'tech', 'textiles', 'tourism', 'general'];

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const loginValidator = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
  validate,
];

export const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').optional().isIn(['admin', 'manager', 'viewer']).withMessage('Invalid role'),
  validate,
];

// ─── Contact ──────────────────────────────────────────────────────────────────

export const contactValidator = [
  body('name').trim().notEmpty().withMessage('Name required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('phone').optional().isMobilePhone('any').withMessage('Invalid phone number'),
  body('subject').trim().notEmpty().withMessage('Subject required'),
  body('division').optional().isIn(DIVISIONS).withMessage('Invalid division'),
  body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters'),
  validate,
];

// ─── Inquiry ──────────────────────────────────────────────────────────────────

export const inquiryValidator = [
  body('company').trim().notEmpty().withMessage('Company name required'),
  body('contactPerson').trim().notEmpty().withMessage('Contact person required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('phone').notEmpty().withMessage('Phone required'),
  body('division').isIn(DIVISIONS).withMessage('Invalid division'),
  body('projectType').trim().notEmpty().withMessage('Project type required'),
  body('description').trim().isLength({ min: 20 }).withMessage('Description must be at least 20 characters'),
  validate,
];

// ─── Newsletter ───────────────────────────────────────────────────────────────

export const newsletterValidator = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  validate,
];

// ─── List Query ───────────────────────────────────────────────────────────────

export const listQueryValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1–100'),
  validate,
];
