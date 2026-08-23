import { Request, Response } from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { TenantUser } from '../models/tenantUser';
import { TenantSettings } from '../models/tennatSettings';
import { Tenant } from '../models/tenants';
import { TenantRole } from '../models/tenantRole';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function bootstrapTenant(req: Request, res: Response) {
  const { credential, company_name, subdomain } = req.body;

  if (!credential || !company_name || !subdomain) {
    return res.status(400).json({ error: 'credential, company_name, and subdomain are required' });
  }

  const cleanSubdomain = subdomain.toLowerCase().trim();
  if (!/^[a-z0-9-]+$/.test(cleanSubdomain)) {
    return res.status(400).json({ error: 'subdomain must be lowercase letters, numbers, and hyphens only' });
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
    if (!payload?.email) {
      return res.status(401).json({ error: 'invalid Google token' });
    }
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: 'invalid Google token' });
  }

  // pre-checks done OUTSIDE the transaction — cheap reads, no need to hold a session for these
  const existingUser = await TenantUser.findOne({ google_id: payload.sub });
  if (existingUser) {
    return res.status(409).json({ error: 'this Google account is already linked to a tenant' });
  }

  const subdomainTaken = await TenantSettings.findOne({ subdomain: cleanSubdomain });
  if (subdomainTaken) {
    return res.status(409).json({ error: 'subdomain already taken' });
  }

  const session = await mongoose.startSession();

  try {
    let tenant, adminRole, adminUser;

    await session.withTransaction(async () => {
      tenant = await Tenant.create(
        [{ company_name, plan_tier: 'free', is_active: true }],
        { session }
      ).then((docs) => docs[0]);

      await TenantSettings.create(
        [{
          client_id: tenant._id,
          subdomain: cleanSubdomain,
          branding: { app_title: company_name },
        }],
        { session }
      );

      adminRole = await TenantRole.create(
        [{
          client_id: tenant._id,
          role_name: 'Admin',
          permissions: [
            'node:read', 'node:create_folder', 'node:upload_file', 'node:edit', 'node:delete',
            'user:manage', 'settings:manage', 'audit:read',
          ],
        }],
        { session }
      ).then((docs) => docs[0]);

      adminUser = await TenantUser.create(
        [{
          client_id: tenant._id,
          email: payload!.email!.toLowerCase(),
          google_id: payload!.sub,
          role_id: adminRole._id,
          scoped_folder_ids: [],
          status: 'active',
        }],
        { session }
      ).then((docs) => docs[0]);
    });

    // transaction committed successfully — safe to use these now
    const token = jwt.sign(
      { userId: adminUser!._id.toString(), clientId: tenant!._id.toString() },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      token,
      tenant: { id: tenant!._id, company_name: tenant!.company_name, subdomain: cleanSubdomain },
      user: { id: adminUser!._id, email: adminUser!.email, role: 'Admin' },
    });
  } catch (err) {
    console.error('tenant bootstrap transaction failed:', err);
    // withTransaction already aborted and rolled back everything automatically on throw
    return res.status(500).json({ error: 'tenant bootstrap failed — no partial data was created' });
  } finally {
    await session.endSession();
  }
}