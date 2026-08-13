export interface TenantUser {
  _id: string;
  client_id: string;
  email: string;
  google_id?: string;
  role_id: { _id: string; role_name: string } | string; // populated or raw, depending on endpoint
  scoped_folder_ids: string[];
  status: 'invited' | 'active' | 'disabled';
  created_at: string;
}