import { Request, Response, NextFunction } from 'express';
import { ApiKey } from '../models/apiKey';
import { verifySecret } from '../services/apiKey.services';


export async function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
  const keyId = req.headers['x-api-key'] as string | undefined;
  const secret = req.headers['x-api-secret'] as string | undefined;

  if (!keyId || !secret) {
    return res.status(401).json({ error: 'X-API-KEY and X-API-SECRET headers are required' });
  }

  try {
    const apiKey = await ApiKey.findOne({ key_id: keyId });
    if (!apiKey || !apiKey.is_active) {
      return res.status(401).json({ error: 'invalid or inactive api key' });
    }

    const isValid = await verifySecret(secret, apiKey.secret_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'invalid api key credentials' });
    }

    req.clientId = apiKey.client_id.toString();
    req.apiKeyId = apiKey._id.toString();

    // update last_used_at, non-blocking — don't delay the request for this
    ApiKey.updateOne({ _id: apiKey._id }, { $set: { last_used_at: new Date() } }).exec();

    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal server error' });
  }
}