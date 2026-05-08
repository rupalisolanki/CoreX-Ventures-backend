import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { Inquiry } from '../models/Inquiry';
import { AppError, catchAsync } from '../middleware/errorHandler';
import { sendInquiryConfirmation, sendInquiryAdminNotification } from '../services/emailService';
import { ListQuery } from '../types';

const buildFilter = (q: ListQuery) => {
  const filter: Record<string, any> = {};
  if (q.status) filter.status = q.status;
  if (q.division) filter.division = q.division;
  if (q.priority) filter.priority = q.priority;
  if (q.search) {
    filter.$or = [
      { company: { $regex: q.search, $options: 'i' } },
      { contactPerson: { $regex: q.search, $options: 'i' } },
      { email: { $regex: q.search, $options: 'i' } },
      { projectType: { $regex: q.search, $options: 'i' } },
    ];
  }
  return filter;
};

export const createInquiry = catchAsync(async (req: Request, res: Response) => {
  const files = (req.files as Express.Multer.File[] | undefined) || [];
  const attachments = files.map((f: Express.Multer.File) => f.path);

  const inquiry = await Inquiry.create({ ...req.body, attachments });

  await Promise.all([
    sendInquiryConfirmation(inquiry.contactPerson, inquiry.email, inquiry.company),
    sendInquiryAdminNotification({
      company: inquiry.company,
      contactPerson: inquiry.contactPerson,
      email: inquiry.email,
      phone: inquiry.phone,
      division: inquiry.division,
      projectType: inquiry.projectType,
      budget: inquiry.budget,
      timeline: inquiry.timeline,
      description: inquiry.description,
    }),
  ]);

  res.status(201).json({
    success: true,
    message: 'Inquiry submitted successfully. Our team will contact you shortly.',
    data: inquiry,
  });
});

export const getInquiries = catchAsync(async (req: Request, res: Response) => {
  const q = req.query as ListQuery;
  const page = parseInt(q.page || '1', 10);
  const limit = parseInt(q.limit || '20', 10);
  const skip = (page - 1) * limit;
  const sort = q.sort || '-createdAt';
  const filter = buildFilter(q);

  const [inquiries, total] = await Promise.all([
    Inquiry.find(filter).sort(sort).skip(skip).limit(limit).populate('assignedTo', 'name email'),
    Inquiry.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    message: 'Inquiries fetched',
    data: inquiries,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  });
});

export const getInquiry = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const inquiry = await Inquiry.findById(req.params.id).populate('assignedTo', 'name email');
  if (!inquiry) return next(new AppError('Inquiry not found', 404));
  res.status(200).json({ success: true, message: 'Inquiry fetched', data: inquiry });
});

export const updateInquiry = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const allowed = ['status', 'priority', 'assignedTo', 'notes'];
  const updates: Record<string, any> = {};
  allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

  const inquiry = await Inquiry.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  }).populate('assignedTo', 'name email');

  if (!inquiry) return next(new AppError('Inquiry not found', 404));
  res.status(200).json({ success: true, message: 'Inquiry updated', data: inquiry });
});

export const deleteInquiry = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
  if (!inquiry) return next(new AppError('Inquiry not found', 404));
  res.status(200).json({ success: true, message: 'Inquiry deleted' });
});

export const getInquiryStats = catchAsync(async (_req: Request, res: Response) => {
  const stats = await Inquiry.aggregate([
    {
      $facet: {
        byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
        byDivision: [{ $group: { _id: '$division', count: { $sum: 1 } } }],
        byPriority: [{ $group: { _id: '$priority', count: { $sum: 1 } } }],
        total: [{ $count: 'count' }],
        last30Days: [
          { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
          { $count: 'count' },
        ],
      },
    },
  ]);
  res.status(200).json({ success: true, message: 'Stats fetched', data: stats[0] });
});
