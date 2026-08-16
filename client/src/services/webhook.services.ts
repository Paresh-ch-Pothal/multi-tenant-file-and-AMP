
import { api } from '../api/apiClient';
import { type Webhook, type NewWebhookResponse } from '../types/webhook';

export async function listWebhooks(): Promise<Webhook[]> {
  const { data } = await api.get('/webhooks');
  return data;
}

export async function createWebhook(url: string, events: string[]): Promise<NewWebhookResponse> {
  const { data } = await api.post('/webhooks', { url, events });
  return data;
}

export async function deleteWebhook(id: string): Promise<void> {
  await api.delete(`/webhooks/${id}`);
}