import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { generateWebhookSecret } from '../services/webhook.services';
import { Webhook } from '../models/webhook';
import { writeAuditLog } from '../services/auditLog.services';
;

// POST /api/v1/tenant/webhooks
export async function createWebhook(req: Request, res: Response) {
  try {
    const { url, events } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'url is required' });
    }
    try {
      new URL(url); // basic validation — throws if malformed
    } catch {
      return res.status(400).json({ error: 'url must be a valid URL' });
    }

    const secret = generateWebhookSecret();

    const webhook = await Webhook.create({
      client_id: req.tenantUser!.client_id,
      url,
      secret,
      events: Array.isArray(events) && events.length > 0 ? events : ['node.upload_file.public'],
      is_active: true,
    });

    await writeAuditLog({
      clientId: req.tenantUser!.client_id,
      actor: { type: 'user', id: req.tenantUser!._id, label: null },
      action: 'settings.update',
      target: { webhook_id: webhook._id },
      metadata: { url, action: 'webhook_created' },
      status: 'success',
      req,
    });

    // secret shown only once — same pattern as API keys
    return res.status(201).json({
      _id: webhook._id,
      url: webhook.url,
      events: webhook.events,
      secret, // only returned here, never again
      warning: 'Store this secret now — it will not be shown again. Use it to verify webhook signatures.',
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal server error' });
  }
}

// GET /api/v1/tenant/webhooks
export async function listWebhooks(req: Request, res: Response) {
  try {
    const webhooks = await Webhook.find({ client_id: req.tenantUser!.client_id })
      .select('-secret')
      .sort({ created_at: -1 });
    return res.json(webhooks);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal server error' });
  }
}

// DELETE /api/v1/tenant/webhooks/:id
export async function deleteWebhook(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id as any)) {
      return res.status(400).json({ error: 'invalid webhook id' });
    }

    const webhook = await Webhook.findOne({ _id: id, client_id: req.tenantUser!.client_id });
    if (!webhook) {
      return res.status(404).json({ error: 'webhook not found' });
    }

    await Webhook.deleteOne({ _id: webhook._id });

    await writeAuditLog({
      clientId: req.tenantUser!.client_id,
      actor: { type: 'user', id: req.tenantUser!._id, label: null },
      action: 'settings.update',
      target: { webhook_id: webhook._id },
      metadata: { url: webhook.url, action: 'webhook_deleted' },
      status: 'success',
      req,
    });

    return res.json({ message: 'webhook deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal server error' });
  }
}