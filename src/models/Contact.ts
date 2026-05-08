import { Schema, model } from 'mongoose';
import { IContact } from '../types';

const contactSchema = new Schema<IContact>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    subject: { type: String, required: true, trim: true },
    division: {
      type: String,
      enum: ['infra', 'exports', 'tech', 'textiles', 'tourism', 'general'],
      default: 'general',
    },
    message: { type: String, required: true },
    status: { type: String, enum: ['new', 'read', 'replied', 'closed'], default: 'new' },
    ipAddress: String,
  },
  { timestamps: true }
);

contactSchema.index({ email: 1, createdAt: -1 });
contactSchema.index({ status: 1 });
contactSchema.index({ division: 1 });

export const Contact = model<IContact>('Contact', contactSchema);
