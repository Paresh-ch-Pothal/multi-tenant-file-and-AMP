import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { TenantUser } from '../models/tenantUser';
import { Permission, TenantRole } from '../models/tenantRole';
import { verifySecret } from '../services/apiKey.services';
import { ApiKey } from '../models/apiKey';



const API_KEY_PERMISSIONS: Permission[] = ['node:read'];

export async function requireAuthOrApiKey(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const apiKeyHeader = req.headers['x-api-key'] as string | undefined;
  const apiSecretHeader = req.headers['x-api-secret'] as string | undefined;
  console.log(apiKeyHeader, apiSecretHeader)

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
      const user = await TenantUser.findById(decoded.userId);

      if (user && user.status === 'active') {
        const role = await TenantRole.findById(user.role_id);
        req.userId = user._id.toString();
        req.tenantUser = {
          _id: user._id,
          client_id: user.client_id,
          scoped_folder_ids: user.scoped_folder_ids,
          permissions: role?.permissions || [],
        };
        return next();
      }
    } catch {
      // fall through to API key
    }
  }

  if (apiKeyHeader && apiSecretHeader) {
    const apiKey = await ApiKey.findOne({ key_id: apiKeyHeader });
    if (apiKey && apiKey.is_active) {
      const isValid = await verifySecret(apiSecretHeader, apiKey.secret_hash);
      if (isValid) {
        req.apiKeyId = apiKey._id.toString();
        req.tenantUser = {
          _id: apiKey._id,
          client_id: apiKey.client_id,
          scoped_folder_ids: [],
          permissions: API_KEY_PERMISSIONS,
        };
        ApiKey.updateOne({ _id: apiKey._id }, { $set: { last_used_at: new Date() } }).exec();
        return next();
      }
    }
  }

  return res.status(401).json({ error: 'authentication required (session token or API key)' });
}