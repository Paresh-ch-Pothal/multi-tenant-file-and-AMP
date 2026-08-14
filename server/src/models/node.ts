import { Schema, model, Types } from 'mongoose';

interface IActor {
  actor_type: 'user' | 'api_key' | 'public';
  actor_id: Types.ObjectId | null;
}

interface IFileMetadata {
  storage_key: string;
  size_bytes: number;
  mime_type: string;
  original_name: string;
}

export interface INode {
  _id: Types.ObjectId;
  client_id: Types.ObjectId;
  type: 'folder' | 'file';
  name: string;
  parent_id: Types.ObjectId | null;
  ancestors: Types.ObjectId[];
  is_public_upload: boolean;
  is_visible_external: boolean;   // ← new: controls whether this shows in the developer-facing catalog
  description: string | null;      // ← new
  tags: string[];                  // ← new
  thumbnail_url: string | null;    // ← new
  file_metadata: IFileMetadata | null;
  is_deleted: boolean;
  created_by: IActor;
  created_at: Date;
  updated_at: Date;
  upload_status?: 'pending' | 'complete';
}

const fileMetadataSchema = new Schema<IFileMetadata>({
  storage_key: { type: String, required: false },
  size_bytes: { type: Number, required: true },
  mime_type: { type: String, required: true },
  original_name: { type: String, required: true },
}, { _id: false });

const actorSchema = new Schema<IActor>({
  actor_type: { type: String, enum: ['user', 'api_key', 'public'], required: true },
  actor_id: { type: Schema.Types.ObjectId, default: null },
}, { _id: false });

const nodeSchema = new Schema<INode>({
  client_id: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  type: { type: String, enum: ['folder', 'file'], required: true },
  name: { type: String, required: true },
  parent_id: { type: Schema.Types.ObjectId, ref: 'Node', default: null, index: true },
  ancestors: { type: [Schema.Types.ObjectId], ref: 'Node', default: [], index: true },
  is_public_upload: { type: Boolean, default: false },
  is_visible_external: { type: Boolean, default: false, index: true }, // opt-in, not opt-out — admin explicitly chooses what's shown
  description: { type: String, default: null, maxlength: 2000 },
  tags: { type: [String], default: [], index: true },
  thumbnail_url: { type: String, default: null },
  file_metadata: { type: fileMetadataSchema, default: null },
  is_deleted: { type: Boolean, default: false },
  created_by: { type: actorSchema, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  upload_status: { type: String, enum: ['pending', 'complete'], default: undefined },
}, { versionKey: false });

nodeSchema.index({ client_id: 1, tags: 1 });

nodeSchema.index({ client_id: 1, parent_id: 1 });
nodeSchema.index({ client_id: 1, ancestors: 1 });

export const Node = model<INode>('Node', nodeSchema, 'nodes');