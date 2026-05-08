import { Schema, model, Types } from 'mongoose';
import { IInquiry } from '../types';

const inquirySchema = new Schema<IInquiry>(
  {
    company: { type: String, required: true, trim: true },
    contactPerson: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    division: {
      type: String,
      enum: ['infra', 'exports', 'tech', 'textiles', 'tourism', 'general'],
      required: true,
    },
    projectType: { type: String, required: true, trim: true },
    budget: String,
    timeline: String,
    description: { type: String, required: true },
    attachments: [{ type: String }],
    status: {
      type: String,
      enum: ['pending', 'in_review', 'quoted', 'accepted', 'rejected'],
      default: 'pending',
    },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    assignedTo: { type: Types.ObjectId, ref: 'User' },
    notes: String,
  },
  { timestamps: true }
);

inquirySchema.index({ status: 1, priority: -1 });
inquirySchema.index({ division: 1 });
inquirySchema.index({ email: 1 });

export const Inquiry = model<IInquiry>('Inquiry', inquirySchema);
