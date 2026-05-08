import { Request, Response, NextFunction } from 'express';
import { Newsletter } from '../models/Newsletter';
import { AppError, catchAsync } from '../middleware/errorHandler';
import { ListQuery } from '../types';

export const subscribe = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;

  const existing = await Newsletter.findOne({ email });
  if (existing) {
    if (existing.isActive) {
      return res.status(200).json({ success: true, message: 'Already subscribed' });
    }
    existing.isActive = true;
    existing.subscribedAt = new Date();
    existing.unsubscribedAt = undefined;
    await existing.save();
    return res.status(200).json({ success: true, message: 'Resubscribed successfully', data: existing });
  }

  const subscriber = await Newsletter.create({ email });
  res.status(201).json({ success: true, message: 'Subscribed successfully', data: subscriber });
});

export const unsubscribe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const subscriber = await Newsletter.findOne({ email: req.body.email });
  if (!subscriber) return next(new AppError('Email not found', 404));

  subscriber.isActive = false;
  subscriber.unsubscribedAt = new Date();
  await subscriber.save();

  res.status(200).json({ success: true, message: 'Unsubscribed successfully' });
});

export const getSubscribers = catchAsync(async (req: Request, res: Response) => {
  const q = req.query as ListQuery;
  const page = parseInt(q.page || '1', 10);
  const limit = parseInt(q.limit || '50', 10);
  const skip = (page - 1) * limit;

  const filter: Record<string, any> = {};
  if (q.status === 'active') filter.isActive = true;
  if (q.status === 'inactive') filter.isActive = false;
  if (q.search) filter.email = { $regex: q.search, $options: 'i' };

  const [subscribers, total] = await Promise.all([
    Newsletter.find(filter).sort('-subscribedAt').skip(skip).limit(limit),
    Newsletter.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    message: 'Subscribers fetched',
    data: subscribers,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  });
});

export const deleteSubscriber = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const sub = await Newsletter.findByIdAndDelete(req.params.id);
  if (!sub) return next(new AppError('Subscriber not found', 404));
  res.status(200).json({ success: true, message: 'Subscriber deleted' });
});
