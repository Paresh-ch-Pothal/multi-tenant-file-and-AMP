import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { TenantUser } from '../models/tenantUser';
import { TenantRole } from '../models/tenantRole';

interface JwtPayload {
  userId: string;
  clientId: string;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'missing or malformed Authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    req.userId = decoded.userId;
    req.clientId = decoded.clientId;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'invalid or expired token' });
  }
}


export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  // no token at all — proceed as anonymous/public
  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string; clientId: string };

    const user = await TenantUser.findById(decoded.userId);
    if (!user || user.status !== 'active') {
      return next(); // invalid session — treat as anonymous rather than hard-fail
    }

    const role = await TenantRole.findById(user.role_id);

    req.userId = user._id.toString();
    req.tenantUser = {
      _id: user._id,
      client_id: user.client_id,
      scoped_folder_ids: user.scoped_folder_ids,
      permissions: role?.permissions || [],
    };

    next();
  } catch {
    // malformed/expired token — treat as anonymous rather than hard-fail
    next();
  }
}