export interface Webhook {
  _id: string;
  client_id: string;
  url: string;
  events: string[];
  is_active: boolean;
  created_at: string;
}

export interface NewWebhookResponse {
  _id: string;
  url: string;
  events: string[];
  secret: string;
  warning: string;
}

export const EVENT_OPTIONS = [
  { value: 'node.upload_file.public', label: 'Public file uploaded' },
];