import { Schema, model, Types } from 'mongoose';

export interface ITenant {
  _id: Types.ObjectId;
  company_name: string;
  plan_tier: string;
  is_active: boolean;
  created_at: Date;
}

const tenantSchema = new Schema<ITenant>({
  company_name: { type: String, required: true },
  plan_tier: { type: String, default: 'free' },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
}, { versionKey: false });

export const Tenant = model<ITenant>('Tenant', tenantSchema, 'tenants');