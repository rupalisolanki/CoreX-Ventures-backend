import { Request, Response, NextFunction } from 'express';
import { Contact } from '../models/Contact';
import { AppError, catchAsync } from '../middleware/errorHandler';
import { sendContactConfirmation, sendContactAdminNotification } from '../services/emailService';
import { ListQuery } from '../types';

const buildQuery = (q: ListQuery) => {
  const filter: Record<string, any> = {};
  if (q.status) filter.status = q.status;
  if (q.division) filter.division = q.division;
  if (q.search) {
    filter.$or = [
      { name: { $regex: q.search, $options: 'i' } },
      { email: { $regex: q.search, $options: 'i' } },
      { subject: { $regex: q.search, $options: 'i' } },
    ];
  }
  return filter;
};

export const createContact = catchAsync(async (req: Request, res: Response) => {
  const contact = await Contact.create({
    ...req.body,
    ipAddress: req.ip,
  });

  await Promise.all([
    sendContactConfirmation(contact.name, contact.email, contact.subject),
    sendContactAdminNotification({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      subject: contact.subject,
      division: contact.division,
      message: contact.message,
    }),
  ]);

  res.status(201).json({
    success: true,
    message: 'Message sent successfully. We will get back to you soon.',
    data: contact,
  });
});

export const getContacts = catchAsync(async (req: Request, res: Response) => {
  const q = req.query as ListQuery;
  const page = parseInt(q.page || '1', 10);
  const limit = parseInt(q.limit || '20', 10);
  const skip = (page - 1) * limit;
  const sort = q.sort || '-createdAt';
  const filter = buildQuery(q);

  const [contacts, total] = await Promise.all([
    Contact.find(filter).sort(sort).skip(skip).limit(limit),
    Contact.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    message: 'Contacts fetched',
    data: contacts,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  });
});

export const getContact = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const contact = await Contact.findById(req.params.id);
  if (!contact) return next(new AppError('Contact not found', 404));
  if (contact.status === 'new') {
    contact.status = 'read';
    await contact.save();
  }
  res.status(200).json({ success: true, message: 'Contact fetched', data: contact });
});

export const updateContactStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const contact = await Contact.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true, runValidators: true }
  );
  if (!contact) return next(new AppError('Contact not found', 404));
  res.status(200).json({ success: true, message: 'Status updated', data: contact });
});

export const deleteContact = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const contact = await Contact.findByIdAndDelete(req.params.id);
  if (!contact) return next(new AppError('Contact not found', 404));
  res.status(200).json({ success: true, message: 'Contact deleted' });
});

export const getContactStats = catchAsync(async (_req: Request, res: Response) => {
  const stats = await Contact.aggregate([
    {
      $facet: {
        byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
        byDivision: [{ $group: { _id: '$division', count: { $sum: 1 } } }],
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
