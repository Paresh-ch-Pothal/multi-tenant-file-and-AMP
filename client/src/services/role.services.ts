
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

export async function updateRole(id: string, role_name: string, permissions: Permission[]): Promise<Role> {
  const { data } = await api.patch(`/roles/${id}`, { role_name, permissions });
  return data;
}

export async function deleteRole(id: string): Promise<{ message: string; users_unassigned: number }> {
  const { data } = await api.delete(`/roles/${id}`);
  return data;
}