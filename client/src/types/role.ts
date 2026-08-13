export type Permission =
  | 'node:read'
  | 'node:create_folder'
  | 'node:upload_file'
  | 'node:edit'
  | 'node:delete'
  | 'user:manage'
  | 'settings:manage'
  | 'audit:read';

export interface Role {
  _id: string;
  client_id: string;
  role_name: string;
  permissions: Permission[];
  created_at: string;
}

export const ALL_PERMISSIONS: { value: Permission; label: string }[] = [
  { value: 'node:read', label: 'View files & folders' },
  { value: 'node:create_folder', label: 'Create folders' },
  { value: 'node:upload_file', label: 'Upload files' },
  { value: 'node:edit', label: 'Rename items' },
  { value: 'node:delete', label: 'Delete items' },
  { value: 'user:manage', label: 'Manage team & roles' },
  { value: 'settings:manage', label: 'Manage settings & API keys' },
  { value: 'audit:read', label: 'View audit log' },
];