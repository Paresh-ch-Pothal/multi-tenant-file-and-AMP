import { randomBytes, createHmac } from 'crypto';

import { logger } from '../middleware/requestLogger';
import { Types } from 'mongoose';
import { Webhook } from '../models/webhook';
import axios from 'axios';

export function generateWebhookSecret(): string {
  return randomBytes(24).toString('hex');
}

function signPayload(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

interface WebhookEventPayload {
  event: string;
  node_id: string;
  folder_id: string;
  file_name: string;
  size_bytes: number;
  uploaded_at: string;
}

// fire-and-forget: never awaited by the calling controller, never throws upward
export async function deliverWebhookEvent(clientId: Types.ObjectId, payload: WebhookEventPayload) {
  try {
    const webhooks = await Webhook.find({
      client_id: clientId,
      is_active: true,
      events: payload.event,
    });

    const body = JSON.stringify(payload);

    await Promise.all(
      webhooks.map(async (webhook) => {
        const signature = signPayload(body, webhook.secret);
        try {
          await axios.post(webhook.url, payload, {
            headers: {
              'Content-Type': 'application/json',
              'X-Webhook-Signature': signature,
            },
            timeout: 5000, // don't let a slow endpoint hang your process
          });
        } catch (err) {
          // log and move on — a failed webhook delivery should never affect the upload itself
          logger.error({ err, webhookId: webhook._id, url: webhook.url }, 'webhook delivery failed');
        }
      })
    );
  } catch (err) {
    logger.error({ err }, 'webhook lookup/delivery failed');
  }
}