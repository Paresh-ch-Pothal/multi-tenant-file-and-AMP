export interface ApiKey {
  _id: string;
  client_id: string;
  key_id: string;
  name: string;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
}

export interface NewApiKeyResponse {
  key_id: string;
  secret: string;
  name: string;
  warning: string;
}