export interface AuthUser {
  id: string;
  email: string;
  role_id?: string;
  role?: string;
  client_id: string;
}

export interface Tenant {
  id: string;
  company_name: string;
  subdomain: string;
}