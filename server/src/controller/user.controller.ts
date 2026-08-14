import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { TenantRole } from '../models/tenantRole';
import { TenantUser } from '../models/tenantUser';
import { writeAuditLog } from '../services/auditLog.services';


// POST /api/v1/tenant/users/invite
export async function inviteUser(req: Request, res: Response) {
  try {
    const { email, role_id, scoped_folder_ids } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'email is required' });
    }
    if (!role_id || !Types.ObjectId.isValid(role_id)) {
      return res.status(400).json({ error: 'valid role_id is required' });
    }

    const clientId = req.tenantUser!.client_id;

    // confirm the role actually belongs to this tenant (prevents assigning another tenant's role)
    const role = await TenantRole.findOne({ _id: role_id, client_id: clientId });
    if (!role) {
      return res.status(404).json({ error: 'role not found' });
    }

    const cleanEmail = email.toLowerCase().trim();

    const existing = await TenantUser.findOne({ client_id: clientId, email: cleanEmail });
    if (existing) {
      return res.status(409).json({ error: 'a user with this email already exists for this tenant' });
    }

    // validate scoped_folder_ids are real ObjectIds if provided
    let scopedIds: Types.ObjectId[] = [];
    if (Array.isArray(scoped_folder_ids)) {
      for (const id of scoped_folder_ids) {
        if (!Types.ObjectId.isValid(id)) {
          return res.status(400).json({ error: `invalid folder id in scoped_folder_ids: ${id}` });
        }
      }
      scopedIds = scoped_folder_ids.map((id: string) => new Types.ObjectId(id));
    }

    const invitedUser = await TenantUser.create({
      client_id: clientId,
      email: cleanEmail,
      role_id: role._id,
      scoped_folder_ids: scopedIds,
      status: 'invited',
      // google_id intentionally omitted — filled in on first login
    });

    await writeAuditLog({
      clientId,
      actor: { type: 'user', id: req.tenantUser!._id, label: null },
      action: 'user.invite',
      target: { user_id: invitedUser._id },
      metadata: { email: cleanEmail, role_name: role.role_name },
      status: 'success',
      req,
    });

    return res.status(201).json(invitedUser);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal server error' });
  }
}

// GET /api/v1/tenant/users
export async function listUsers(req: Request, res: Response) {
  try {
    const users = await TenantUser.find({ client_id: req.tenantUser!.client_id })
      .populate('role_id', 'role_name')
      .sort({ email: 1 });

    return res.json(users);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal server error' });
  }
}

// PATCH /api/v1/tenant/users/:id
export async function updateUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { email, role_id } = req.body;

    if (!Types.ObjectId.isValid(id as any)) {
      return res.status(400).json({ error: 'invalid user id' });
    }

    const clientId = req.tenantUser!.client_id;
    const targetUser = await TenantUser.findOne({ _id: id, client_id: clientId });
    if (!targetUser) {
      return res.status(404).json({ error: 'user not found' });
    }

    const changes: Record<string, unknown> = {};

    if (email) {
      const cleanEmail = email.toLowerCase().trim();
      if (cleanEmail !== targetUser.email) {
        const emailTaken = await TenantUser.findOne({
          client_id: clientId,
          email: cleanEmail,
          _id: { $ne: targetUser._id },
        });
        if (emailTaken) {
          return res.status(409).json({ error: 'a user with this email already exists' });
        }
        changes.old_email = targetUser.email;
        changes.new_email = cleanEmail;
        targetUser.email = cleanEmail;
      }
    }

    if (role_id !== undefined) {
      if (role_id === null) {
        targetUser.role_id = null;
      } else {
        if (!Types.ObjectId.isValid(role_id)) {
          return res.status(400).json({ error: 'invalid role_id' });
        }
        const role = await TenantRole.findOne({ _id: role_id, client_id: clientId });
        if (!role) {
          return res.status(404).json({ error: 'role not found' });
        }
        changes.new_role_name = role.role_name;
        targetUser.role_id = role._id;
      }
    }

    await targetUser.save();

    await writeAuditLog({
      clientId,
      actor: { type: 'user', id: req.tenantUser!._id, label: null },
      action: 'user.role_change',
      target: { user_id: targetUser._id },
      metadata: changes,
      status: 'success',
      req,
    });

    return res.json(targetUser);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal server error' });
  }
}

// DELETE /api/v1/tenant/users/:id
export async function deleteUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id as any)) {
      return res.status(400).json({ error: 'invalid user id' });
    }

    const clientId = req.tenantUser!.client_id;

    // prevent a user from deleting themselves — avoids locking yourself out by accident
    if (id === req.tenantUser!._id.toString()) {
      return res.status(400).json({ error: 'you cannot delete your own account' });
    }

    const targetUser = await TenantUser.findOne({ _id: id, client_id: clientId });
    if (!targetUser) {
      return res.status(404).json({ error: 'user not found' });
    }

    await TenantUser.deleteOne({ _id: targetUser._id });

    await writeAuditLog({
      clientId,
      actor: { type: 'user', id: req.tenantUser!._id, label: null },
      action: 'user.role_change',
      target: { user_id: targetUser._id },
      metadata: { deleted_email: targetUser.email },
      status: 'success',
      req,
    });

    return res.json({ message: 'user deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal server error' });
  }
}