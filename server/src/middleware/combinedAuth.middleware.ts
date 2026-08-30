import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { TenantUser } from '../models/tenantUser';
import { Permission, TenantRole } from '../models/tenantRole';
import { verifySecret } from '../services/apiKey.services';
import { ApiKey } from '../models/apiKey';
import { ApiKeyUsage } from '../models/apiKeyUsage';



const API_KEY_PERMISSIONS: Permission[] = ['node:read'];
const DAILY_REQUEST_LIMIT = 50;

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
        const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

        // check today's usage BEFORE allowing the request through
        const existingUsage = await ApiKeyUsage.findOne({ api_key_id: apiKey._id, date: today });
        const currentCount = existingUsage?.count || 0;

        if (currentCount >= DAILY_REQUEST_LIMIT) {
          return res.status(429).json({
            error: `Daily request limit reached (${DAILY_REQUEST_LIMIT}/day). Resets at midnight UTC.`,
            limit: DAILY_REQUEST_LIMIT,
            used: currentCount,
          });
        }

        // atomically increment — upsert handles the "first request of the day" case in one step
        await ApiKeyUsage.updateOne(
          { api_key_id: apiKey._id, date: today },
          { $inc: { count: 1 }, $setOnInsert: { client_id: apiKey.client_id } },
          { upsert: true }
        );

        req.apiKeyId = apiKey._id.toString();
        req.tenantUser = {
          _id: apiKey._id,
          client_id: apiKey.client_id,
          scoped_folder_ids: [],
          permissions: API_KEY_PERMISSIONS,
        };

        res.setHeader('X-RateLimit-Limit', DAILY_REQUEST_LIMIT.toString());
        res.setHeader('X-RateLimit-Remaining', (DAILY_REQUEST_LIMIT - currentCount - 1).toString());

        ApiKey.updateOne({ _id: apiKey._id }, { $set: { last_used_at: new Date() } }).exec();
        return next();
      }
    }
  }

  return res.status(401).json({ error: 'authentication required (session token or API key)' });
}