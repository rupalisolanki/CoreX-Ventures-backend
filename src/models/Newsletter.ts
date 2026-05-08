import { Schema, model } from 'mongoose';
import { INewsletter } from '../types';

const newsletterSchema = new Schema<INewsletter>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    isActive: { type: Boolean, default: true },
    subscribedAt: { type: Date, default: Date.now },
    unsubscribedAt: Date,
  },
  { timestamps: false }
);

export const Newsletter = model<INewsletter>('Newsletter', newsletterSchema);
