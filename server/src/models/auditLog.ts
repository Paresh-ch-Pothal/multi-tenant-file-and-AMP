import { Schema, model, Types } from 'mongoose';

export type AuditAction =
  | 'node.create_folder'
  | 'node.upload_file'
  | 'node.rename'
  | 'node.delete'
  | 'node.cascade_delete'
  | 'user.invite'
  | 'user.role_change'
  | 'role.create'          // ← new
  | 'apikey.create'
  | 'apikey.revoke'
  | 'settings.update'
  | 'node.metadata_update'; // ← new

interface IAuditActor {
  type: 'user' | 'api_key' | 'public';
  id: Types.ObjectId | null;
  label: string | null;
}

interface IAuditTarget {
  node_id?: Types.ObjectId;
  parent_id?: Types.ObjectId | null;
  [key: string]: unknown; // action-specific extra fields (e.g. user_id for user.invite)
}

export interface IAuditLog {
  _id: Types.ObjectId;
  client_id: Types.ObjectId;
  actor: IAuditActor;
  action: AuditAction;
  target: IAuditTarget;
  metadata: Record<string, unknown>;
  status: 'success' | 'failure';
  request_id: string | null;
  ip_address: string | null;
  created_at: Date;
}

const auditLogSchema = new Schema<IAuditLog>({
  client_id: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  actor: {
    type: {
      type: String,
      enum: ['user', 'api_key', 'public'],
      required: true,
    },
    id: { type: Schema.Types.ObjectId, default: null },
    label: { type: String, default: null },
  },
  action: { type: String, required: true },
  target: { type: Schema.Types.Mixed, default: {} },
  metadata: { type: Schema.Types.Mixed, default: {} },
  status: { type: String, enum: ['success', 'failure'], required: true },
  request_id: { type: String, default: null },
  ip_address: { type: String, default: null },
  created_at: { type: Date, default: Date.now },
}, { versionKey: false });

// matches the retention/indexing plan from your doc (Section 8b)
auditLogSchema.index({ client_id: 1, created_at: -1 });
auditLogSchema.index({ client_id: 1, 'target.node_id': 1 });

export const AuditLog = model<IAuditLog>('AuditLog', auditLogSchema, 'audit_logs');