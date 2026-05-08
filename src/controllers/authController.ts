import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { config } from '../config/env';
import { AppError, catchAsync } from '../middleware/errorHandler';
import { AuthRequest } from '../types';

const signToken = (id: string): string =>
  jwt.sign({ id }, config.jwt.secret, { expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'] });

const sendToken = (user: any, statusCode: number, res: Response): void => {
  const token = signToken(user._id.toString());

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'strict',
    maxAge: config.jwt.cookieExpiresIn * 24 * 60 * 60 * 1000,
  });

  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    message: 'Authentication successful',
    data: { token, user },
  });
};

export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email, isActive: true }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Invalid email or password', 401));
  }

  sendToken(user, 200, res);
});

export const register = catchAsync(async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;
  const user = await User.create({ name, email, password, role });
  sendToken(user, 201, res);
});

export const logout = (_req: Request, res: Response): void => {
  res.cookie('jwt', 'loggedout', { httpOnly: true, expires: new Date(Date.now() + 1000) });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

export const getMe = catchAsync(async (req: AuthRequest, res: Response) => {
  res.status(200).json({ success: true, message: 'User fetched', data: req.user });
});

export const updatePassword = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = await User.findById(req.user!._id).select('+password');
  if (!user) return next(new AppError('User not found', 404));

  const { currentPassword, newPassword } = req.body as { currentPassword: string; newPassword: string };
  if (!(await user.comparePassword(currentPassword))) {
    return next(new AppError('Current password is incorrect', 401));
  }

  user.password = newPassword;
  await user.save();
  sendToken(user, 200, res);
});

export const getUsers = catchAsync(async (_req: Request, res: Response) => {
  const users = await User.find().select('-password');
  res.status(200).json({ success: true, message: 'Users fetched', data: users });
});

export const updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name, role: req.body.role, isActive: req.body.isActive },
    { new: true, runValidators: true }
  );
  if (!user) return next(new AppError('User not found', 404));
  res.status(200).json({ success: true, message: 'User updated', data: user });
});
