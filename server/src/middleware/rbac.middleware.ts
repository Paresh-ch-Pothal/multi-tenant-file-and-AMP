import { Request, Response, NextFunction } from 'express';
import { Permission, TenantRole } from '../models/tenantRole';
import { TenantUser } from '../models/tenantUser';

/**
 * Must run AFTER requireAuth (needs req.userId already set from the JWT).
 * Resolves the user + their role's permissions once, attaches to req.tenantUser,
 * then checks the requested permission is included.
 */
export function requirePermission(permission: Permission) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'unauthenticated' });
      }

      const user = await TenantUser.findById(req.userId);
      if (!user || user.status !== 'active') {
        return res.status(403).json({ error: 'user not found or inactive' });
      }

      const role = await TenantRole.findById(user.role_id);
      if (!role) {
        return res.status(403).json({ error: 'role not found' });
      }

      if (!role.permissions.includes(permission)) {
        return res.status(403).json({ error: `missing permission: ${permission}` });
      }

      // attach resolved user context so controllers don't re-query
      req.tenantUser = {
        _id: user._id,
        client_id: user.client_id,
        scoped_folder_ids: user.scoped_folder_ids,
        permissions: role.permissions,
      };

      console.log(req.tenantUser);

      next();
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'internal server error' });
    }
  };
}