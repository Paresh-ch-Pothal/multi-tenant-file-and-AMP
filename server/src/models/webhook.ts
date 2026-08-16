import { Schema, model, Types } from 'mongoose';

export interface IWebhook {
  _id: Types.ObjectId;
  client_id: Types.ObjectId;
  url: string;
  secret: string; // used to sign payloads — shown once at creation, like an API key
  events: string[]; // e.g. ['node.upload_file.public']
  is_active: boolean;
  created_at: Date;
}

const webhookSchema = new Schema<IWebhook>({
  client_id: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  url: { type: String, required: true },
  secret: { type: String, required: true },
  events: { type: [String], default: ['node.upload_file.public'] },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
}, { versionKey: false });

export const Webhook = model<IWebhook>('Webhook', webhookSchema, 'webhooks');