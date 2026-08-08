import { Schema, model, Types } from 'mongoose';

interface IBranding {
  app_title: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
}

export interface ITenantSettings {
  _id: Types.ObjectId;
  client_id: Types.ObjectId;
  subdomain: string;
  branding: IBranding;
  created_at: Date;
}

const brandingSchema = new Schema<IBranding>({
  app_title: { type: String, default: 'File Portal' },
  logo_url: { type: String, default: null },
  primary_color: { type: String, default: '#1E40AF' },
  secondary_color: { type: String, default: '#DB2777' },
}, { _id: false });

const tenantSettingsSchema = new Schema<ITenantSettings>({
  client_id: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, unique: true },
  subdomain: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[a-z0-9-]+$/, // no dots, no special chars — keeps it URL-safe
  },
  branding: { type: brandingSchema, default: () => ({}) },
  created_at: { type: Date, default: Date.now },
}, { versionKey: false });

export const TenantSettings = model<ITenantSettings>('TenantSettings', tenantSettingsSchema, 'tenant_settings');