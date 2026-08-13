
import { api } from '../api/apiClient';
import { type Role, type Permission } from '../types/role';

export async function listRoles(): Promise<Role[]> {
  const { data } = await api.get('/roles/');
  return data;
}

export async function createRole(role_name: string, permissions: Permission[]): Promise<Role> {
  const { data } = await api.post('/roles/', { role_name, permissions });
  return data;
}