import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Permission, TenantRole } from '../models/tenantRole';
import { writeAuditLog } from '../services/auditLog.services';
import { TenantUser } from '../models/tenantUser';


const VALID_PERMISSIONS: Permission[] = [
  'node:read', 'node:create_folder', 'node:upload_file', 'node:edit', 'node:delete',
  'user:manage', 'settings:manage', 'audit:read',
];

// POST /api/v1/tenant/roles
export async function createRole(req: Request, res: Response) {
  try {
    const { role_name, permissions } = req.body;

    if (!role_name || typeof role_name !== 'string') {
      return res.status(400).json({ error: 'role_name is required' });
    }
    if (!Array.isArray(permissions) || permissions.length === 0) {
      return res.status(400).json({ error: 'permissions must be a non-empty array' });
    }

    const invalidPerms = permissions.filter((p) => !VALID_PERMISSIONS.includes(p));
    if (invalidPerms.length > 0) {
      return res.status(400).json({ error: `invalid permissions: ${invalidPerms.join(', ')}` });
    }

    const existing = await TenantRole.findOne({
      client_id: req.tenantUser!.client_id,
      role_name: role_name.trim(),
    });
    if (existing) {
      return res.status(409).json({ error: 'a role with this name already exists' });
    }

    const role = await TenantRole.create({
      client_id: req.tenantUser!.client_id,
      role_name: role_name.trim(),
      permissions,
    });

    await writeAuditLog({
      clientId: req.tenantUser!.client_id,
      actor: { type: 'user', id: req.tenantUser!._id, label: null },
      action: 'user.role_change', // reusing the closest existing action; see note below
      target: { role_id: role._id },
      metadata: { role_name: role.role_name, permissions },
      status: 'success',
      req,
    });

    return res.status(201).json(role);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal server error' });
  }
}

// GET /api/v1/tenant/roles
export async function listRoles(req: Request, res: Response) {
  try {
    const roles = await TenantRole.find({ client_id: req.tenantUser!.client_id }).sort({ role_name: 1 });
    return res.json(roles);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal server error' });
  }
}

export async function updateRole(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { role_name, permissions } = req.body;

    if (!Types.ObjectId.isValid(id as any)) {
      return res.status(400).json({ error: 'invalid role id' });
    }

    const role = await TenantRole.findOne({ _id: id, client_id: req.tenantUser!.client_id });
    if (!role) {
      return res.status(404).json({ error: 'role not found' });
    }

    if (permissions) {
      const invalidPerms = permissions.filter((p: string) => !VALID_PERMISSIONS.includes(p as Permission));
      if (invalidPerms.length > 0) {
        return res.status(400).json({ error: `invalid permissions: ${invalidPerms.join(', ')}` });
      }
      role.permissions = permissions;
    }

    if (role_name && role_name.trim() !== role.role_name) {
      const nameTaken = await TenantRole.findOne({
        client_id: req.tenantUser!.client_id,
        role_name: role_name.trim(),
        _id: { $ne: role._id },
      });
      if (nameTaken) {
        return res.status(409).json({ error: 'a role with this name already exists' });
      }
      role.role_name = role_name.trim();
    }

    await role.save();

    await writeAuditLog({
      clientId: req.tenantUser!.client_id,
      actor: { type: 'user', id: req.tenantUser!._id, label: null },
      action: 'user.role_change',
      target: { role_id: role._id },
      metadata: { role_name: role.role_name, permissions: role.permissions },
      status: 'success',
      req,
    });

    return res.json(role);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal server error' });
  }
}

// DELETE /api/v1/tenant/roles/:id
export async function deleteRole(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id as any)) {
      return res.status(400).json({ error: 'invalid role id' });
    }

    const role = await TenantRole.findOne({ _id: id, client_id: req.tenantUser!.client_id });
    if (!role) {
      return res.status(404).json({ error: 'role not found' });
    }

    // find every user currently assigned this role, unassign them (role_id -> null)
    const affectedResult = await TenantUser.updateMany(
      { client_id: req.tenantUser!.client_id, role_id: role._id },
      { $set: { role_id: null } }
    );

    await TenantRole.deleteOne({ _id: role._id });

    await writeAuditLog({
      clientId: req.tenantUser!.client_id,
      actor: { type: 'user', id: req.tenantUser!._id, label: null },
      action: 'user.role_change',
      target: { role_id: role._id },
      metadata: {
        deleted_role_name: role.role_name,
        users_unassigned: affectedResult.modifiedCount,
      },
      status: 'success',
      req,
    });

    return res.json({
      message: 'role deleted',
      users_unassigned: affectedResult.modifiedCount,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal server error' });
  }
}