import { Schema, model, Types } from 'mongoose';

export type Permission =
  | 'node:read'
  | 'node:create_folder'
  | 'node:upload_file'
  | 'node:edit'
  | 'node:delete'
  | 'user:manage'
  | 'settings:manage'
  | 'audit:read';

export interface ITenantRole {
  _id: Types.ObjectId;
  client_id: Types.ObjectId;
  role_name: string;
  permissions: Permission[];
  created_at: Date;
}

const ALL_PERMISSIONS: Permission[] = [
  'node:read',
  'node:create_folder',
  'node:upload_file',
  'node:edit',
  'node:delete',
  'user:manage',
  'settings:manage',
  'audit:read',
];

const tenantRoleSchema = new Schema<ITenantRole>({
  client_id: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  role_name: { type: String, required: true, trim: true },
  permissions: {
    type: [String],
    enum: ALL_PERMISSIONS,
    default: [],
  },
  created_at: { type: Date, default: Date.now },
}, { versionKey: false });

// role names should be unique within a tenant ("Admin" can't be defined twice for Acme)
tenantRoleSchema.index({ client_id: 1, role_name: 1 }, { unique: true });

export const TenantRole = model<ITenantRole>('TenantRole', tenantRoleSchema, 'tenant_roles');