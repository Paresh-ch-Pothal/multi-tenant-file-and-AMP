

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

export async function updateUser(id: string, updates: { email?: string; role_id?: string | null }): Promise<TenantUser> {
  const { data } = await api.patch(`/users/${id}`, updates);
  return data;
}

export async function deleteUser(id: string): Promise<{ message: string }> {
  const { data } = await api.delete(`/users/${id}`);
  return data;
}