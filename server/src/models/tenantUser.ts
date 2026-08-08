import { Schema, model, Types } from 'mongoose';

export interface ITenantUser {
  _id: Types.ObjectId;
  client_id: Types.ObjectId;
  email: string;
  google_id: string;
  role_id: Types.ObjectId;
  scoped_folder_ids: Types.ObjectId[];
  status: 'invited' | 'active' | 'disabled';
  created_at: Date;
}

const tenantUserSchema = new Schema<ITenantUser>({
  client_id: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  google_id: { type: String, unique: true, sparse: true, index: true },
  role_id: { type: Schema.Types.ObjectId, ref: 'TenantRole', required: true },
  scoped_folder_ids: { type: [Schema.Types.ObjectId], ref: 'Node', default: [] },
  status: { type: String, enum: ['invited', 'active', 'disabled'], default: 'invited' },
  created_at: { type: Date, default: Date.now },
}, { versionKey: false });

// one email per tenant, not globally unique (same person could belong to multiple tenants)
tenantUserSchema.index({ client_id: 1, email: 1 }, { unique: true });

export const TenantUser = model<ITenantUser>('TenantUser', tenantUserSchema, 'tenant_users');