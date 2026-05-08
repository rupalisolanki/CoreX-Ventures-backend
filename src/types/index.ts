import { Request } from 'express';
import { Document, Types } from 'mongoose';

// ─── Enums ────────────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'manager' | 'viewer';
export type Division = 'infra' | 'exports' | 'tech' | 'textiles' | 'tourism' | 'general';
export type ContactStatus = 'new' | 'read' | 'replied' | 'closed';
export type InquiryStatus = 'pending' | 'in_review' | 'quoted' | 'accepted' | 'rejected';
export type InquiryPriority = 'low' | 'medium' | 'high';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  passwordChangedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
  changedPasswordAfter(jwtIat: number): boolean;
}

export interface IContact extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  division: Division;
  message: string;
  status: ContactStatus;
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInquiry extends Document {
  _id: Types.ObjectId;
  company: string;
  contactPerson: string;
  email: string;
  phone: string;
  division: Division;
  projectType: string;
  budget?: string;
  timeline?: string;
  description: string;
  attachments: string[];
  status: InquiryStatus;
  priority: InquiryPriority;
  assignedTo?: Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface INewsletter extends Document {
  _id: Types.ObjectId;
  email: string;
  isActive: boolean;
  subscribedAt: Date;
  unsubscribedAt?: Date;
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// ─── Auth Request ─────────────────────────────────────────────────────────────

export interface AuthRequest extends Request {
  user?: IUser;
}

// ─── Query Params ─────────────────────────────────────────────────────────────

export interface ListQuery {
  page?: string;
  limit?: string;
  sort?: string;
  search?: string;
  status?: string;
  division?: string;
  priority?: string;
}
