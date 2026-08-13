
import { api } from '../api/apiClient';
import { type ApiKey, type NewApiKeyResponse } from '../types/apiKeys';

export async function listApiKeys(): Promise<ApiKey[]> {
  const { data } = await api.get('/api-keys/');
  return data;
}

export async function createApiKey(name: string): Promise<NewApiKeyResponse> {
  const { data } = await api.post('/api-keys/', { name });
  return data;
}

export async function revokeApiKey(id: string): Promise<void> {
  await api.delete(`/api-keys/${id}`);
}