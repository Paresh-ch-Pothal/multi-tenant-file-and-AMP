import { Schema, model, Types } from 'mongoose';

export interface IApiKey {
  _id: Types.ObjectId;
  client_id: Types.ObjectId;
  key_id: string;        // public identifier, safe to log/display
  secret_hash: string;   // bcrypt hash of the actual secret
  name: string;
  is_active: boolean;
  last_used_at: Date | null;
  created_at: Date;
}

const apiKeySchema = new Schema<IApiKey>({
  client_id: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  key_id: { type: String, required: true, unique: true, index: true },
  secret_hash: { type: String, required: true },
  name: { type: String, required: true },
  is_active: { type: Boolean, default: true },
  last_used_at: { type: Date, default: null },
  created_at: { type: Date, default: Date.now },
}, { versionKey: false });

export const ApiKey = model<IApiKey>('ApiKey', apiKeySchema, 'api_keys');