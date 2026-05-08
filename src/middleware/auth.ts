import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { User } from '../models/User';
import { AppError, catchAsync } from './errorHandler';
import { AuthRequest, UserRole } from '../types';

export const protect = catchAsync(async (req: AuthRequest, _res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) return next(new AppError('Not authenticated. Please log in.', 401));

  const decoded = jwt.verify(token, config.jwt.secret) as { id: string; iat: number };

  const user = await User.findById(decoded.id).select('+password');
  if (!user || !user.isActive) return next(new AppError('User no longer exists or is inactive.', 401));

  if (user.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('Password recently changed. Please log in again.', 401));
  }

  req.user = user;
  next();
});

export const restrictTo = (...roles: UserRole[]) =>
  (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }
    next();
  };
