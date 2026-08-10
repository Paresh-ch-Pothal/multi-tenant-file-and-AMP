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