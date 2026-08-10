import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { generateApiKeyPair, hashSecret } from '../services/apiKey.services';
import { ApiKey } from '../models/apiKey';
import { writeAuditLog } from '../services/auditLog.services';


// POST /api/v1/auth/keys
export async function createApiKey(req: Request, res: Response) {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'name is required' });
    }

    const { keyId, secret } = generateApiKeyPair();
    const secretHash = await hashSecret(secret);

    const apiKey = await ApiKey.create({
      client_id: req.tenantUser!.client_id,
      key_id: keyId,
      secret_hash: secretHash,
      name,
      is_active: true,
    });

    await writeAuditLog({
      clientId: req.tenantUser!.client_id,
      actor: { type: 'user', id: req.tenantUser!._id, label: null },
      action: 'apikey.create',
      target: { api_key_id: apiKey._id },
      metadata: { name },
      status: 'success',
      req,
    });

    // IMPORTANT: secret is only ever shown once, right here, at creation time.
    // It's never retrievable again after this response — only the hash is stored.
    return res.status(201).json({
      key_id: keyId,
      secret,
      name: apiKey.name,
      warning: 'Store this secret now — it will not be shown again.',
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal server error' });
  }
}

// GET /api/v1/auth/keys
export async function listApiKeys(req: Request, res: Response) {
  try {
    const keys = await ApiKey.find({ client_id: req.tenantUser!.client_id })
      .select('-secret_hash') // never expose the hash, even to the owning tenant
      .sort({ created_at: -1 });

    return res.json(keys);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal server error' });
  }
}

// DELETE /api/v1/auth/keys/:id — revoke
export async function revokeApiKey(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id as any)) {
      return res.status(400).json({ error: 'invalid api key id' });
    }

    const key = await ApiKey.findOne({ _id: id, client_id: req.tenantUser!.client_id });
    if (!key) {
      return res.status(404).json({ error: 'api key not found' });
    }

    key.is_active = false;
    await key.save();

    await writeAuditLog({
      clientId: req.tenantUser!.client_id,
      actor: { type: 'user', id: req.tenantUser!._id, label: null },
      action: 'apikey.revoke',
      target: { api_key_id: key._id },
      metadata: { name: key.name },
      status: 'success',
      req,
    });

    return res.json({ message: 'api key revoked' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal server error' });
  }
}