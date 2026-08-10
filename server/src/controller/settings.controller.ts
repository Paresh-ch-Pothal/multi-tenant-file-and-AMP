import { Request, Response } from 'express';
import { TenantSettings } from '../models/tennatSettings';
import { writeAuditLog } from '../services/auditLog.services';


// GET /api/v1/tenant/settings — public lookup by subdomain (for branding the login page etc.)
// OR authenticated lookup for the logged-in tenant's own settings
export async function getSettings(req: Request, res: Response) {
  try {
    let settings;

    if (req.tenantUser) {
      // authenticated — return their own tenant's settings
      settings = await TenantSettings.findOne({ client_id: req.tenantUser.client_id });
    } else {
      // public — resolve by subdomain query param (frontend passes this before login)
      const subdomain = (req.query.subdomain as string)?.toLowerCase();
      if (!subdomain) {
        return res.status(400).json({ error: 'subdomain is required' });
      }
      settings = await TenantSettings.findOne({ subdomain });
    }

    if (!settings) {
      return res.status(404).json({ error: 'settings not found' });
    }

    return res.json(settings);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal server error' });
  }
}

// PATCH /api/v1/tenant/settings — update branding, requires settings:manage
export async function updateSettings(req: Request, res: Response) {
  try {
    const { branding } = req.body;

    const settings = await TenantSettings.findOne({ client_id: req.tenantUser!.client_id });
    if (!settings) {
      return res.status(404).json({ error: 'settings not found' });
    }

    if (branding) {
      settings.branding = { ...settings.branding, ...branding };
    }
    await settings.save();

    await writeAuditLog({
      clientId: req.tenantUser!.client_id,
      actor: { type: 'user', id: req.tenantUser!._id, label: null },
      action: 'settings.update',
      target: { node_id: undefined },
      metadata: { updated_fields: Object.keys(branding || {}) },
      status: 'success',
      req,
    });

    return res.json(settings);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal server error' });
  }
}