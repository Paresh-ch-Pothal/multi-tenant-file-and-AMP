import { Request, Response } from 'express';

import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { TenantUser } from '../models/tenantUser';
import { TenantSettings } from '../models/tennatSettings';
import { Tenant } from '../models/tenants';
import { TenantRole } from '../models/tenantRole';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST /api/v1/tenant/bootstrap
// Creates a brand-new tenant + its Admin role + the first user, from a Google credential.
export async function bootstrapTenant(req: Request, res: Response) {
  try {
    const { credential, company_name, subdomain } = req.body;

    if (!credential || !company_name || !subdomain) {
      return res.status(400).json({ error: 'credential, company_name, and subdomain are required' });
    }

    const cleanSubdomain = subdomain.toLowerCase().trim();
    if (!/^[a-z0-9-]+$/.test(cleanSubdomain)) {
      return res.status(400).json({ error: 'subdomain must be lowercase letters, numbers, and hyphens only' });
    }

    // verify Google identity first
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email) {
      return res.status(401).json({ error: 'invalid Google token' });
    }

    // reject if this Google account already belongs to a tenant
    const existingUser = await TenantUser.findOne({ google_id: payload.sub });
    if (existingUser) {
      return res.status(409).json({ error: 'this Google account is already linked to a tenant' });
    }

    // reject duplicate subdomain
    const subdomainTaken = await TenantSettings.findOne({ subdomain: cleanSubdomain });
    if (subdomainTaken) {
      return res.status(409).json({ error: 'subdomain already taken' });
    }

    // 1. create tenant
    const tenant = await Tenant.create({ company_name, plan_tier: 'free', is_active: true });

    // 2. create default settings (subdomain + default branding)
    await TenantSettings.create({
      client_id: tenant._id,
      subdomain: cleanSubdomain,
      branding: { app_title: company_name },
    });

    // 3. create the built-in Admin role with every permission
    const adminRole = await TenantRole.create({
      client_id: tenant._id,
      role_name: 'Admin',
      permissions: [
        'node:read', 'node:create_folder', 'node:upload_file', 'node:edit', 'node:delete',
        'user:manage', 'settings:manage', 'audit:read',
      ],
    });

    // 4. create the first user, already active (no invite step needed for user zero)
    const adminUser = await TenantUser.create({
      client_id: tenant._id,
      email: payload.email.toLowerCase(),
      google_id: payload.sub,
      role_id: adminRole._id,
      scoped_folder_ids: [],
      status: 'active',
    });

    // 5. issue session token immediately
    const token = jwt.sign(
      { userId: adminUser._id.toString(), clientId: tenant._id.toString() },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      token,
      tenant: { id: tenant._id, company_name: tenant.company_name, subdomain: cleanSubdomain },
      user: { id: adminUser._id, email: adminUser.email, role: 'Admin' },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'tenant bootstrap failed' });
  }
}