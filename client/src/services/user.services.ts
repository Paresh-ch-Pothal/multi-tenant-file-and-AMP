

import { api } from '../api/apiClient';
import { type TenantUser } from '../types/user';

export async function listUsers(): Promise<TenantUser[]> {
  const { data } = await api.get('/users/');
  return data;
}

export async function inviteUser(email: string, role_id: string): Promise<TenantUser> {
  const { data } = await api.post('/users/invite', { email, role_id });
  return data;
}