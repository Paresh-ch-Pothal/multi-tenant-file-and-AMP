export type AuditAction =
  | 'node.create_folder'
  | 'node.upload_file'
  | 'node.rename'
  | 'node.delete'
  | 'node.cascade_delete'
  | 'user.invite'
  | 'user.role_change'
  | 'role.create'
  | 'apikey.create'
  | 'apikey.revoke'
  | 'settings.update';

export interface AuditLogEntry {
  _id: string;
  client_id: string;
  actor: {
    type: 'user' | 'api_key' | 'public';
    id: string | null;
    label: string | null;
  };
  action: AuditAction;
  target: Record<string, unknown>;
  metadata: Record<string, unknown>;
  status: 'success' | 'failure';
  request_id: string | null;
  ip_address: string | null;
  created_at: string;
}

export interface AuditLogResponse {
  logs: AuditLogEntry[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export const ACTION_OPTIONS: { value: AuditAction; label: string }[] = [
  { value: 'node.create_folder', label: 'Folder created' },
  { value: 'node.upload_file', label: 'File uploaded' },
  { value: 'node.rename', label: 'Item renamed' },
  { value: 'node.delete', label: 'Item deleted' },
  { value: 'node.cascade_delete', label: 'Folder deleted (cascade)' },
  { value: 'user.invite', label: 'User invited' },
  { value: 'user.role_change', label: 'Role changed' },
  { value: 'role.create', label: 'Role created' },
  { value: 'apikey.create', label: 'API key created' },
  { value: 'apikey.revoke', label: 'API key revoked' },
  { value: 'settings.update', label: 'Settings updated' },
];