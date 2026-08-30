import { Schema, model, Types } from 'mongoose';

export interface IApiKeyUsage {
    _id: Types.ObjectId;
    api_key_id: Types.ObjectId;
    client_id: Types.ObjectId;
    date: string; // YYYY-MM-DD, one document per key per day
    count: number;
}

const apiKeyUsageSchema = new Schema<IApiKeyUsage>({
    api_key_id: { type: Schema.Types.ObjectId, ref: 'ApiKey', required: true, index: true },
    client_id: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    date: { type: String, required: true, index: true }, // e.g. "2026-08-30"
    count: { type: Number, default: 0 },
}, { versionKey: false });

// one document per key per day — lets us atomically increment without race conditions
apiKeyUsageSchema.index({ api_key_id: 1, date: 1 }, { unique: true });

export const ApiKeyUsage = model<IApiKeyUsage>('ApiKeyUsage', apiKeyUsageSchema, 'api_key_usage');