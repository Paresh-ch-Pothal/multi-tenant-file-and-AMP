import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { AuditLog } from '../models/auditLog';


export async function listAuditLogs(req: Request, res: Response) {
  try {
    const clientId = req.tenantUser!.client_id;
    const { node_id, action, from, to } = req.query;

    const filter: Record<string, unknown> = { client_id: clientId };

    if (node_id) {
      if (!Types.ObjectId.isValid(node_id as string)) {
        return res.status(400).json({ error: 'invalid node_id' });
      }
      filter['target.node_id'] = new Types.ObjectId(node_id as string);
    }

    if (action) {
      filter.action = action as string;
    }

    if (from || to) {
      const dateFilter: Record<string, Date> = {};
      if (from) dateFilter.$gte = new Date(from as string);
      if (to) dateFilter.$lte = new Date(to as string);
      filter.created_at = dateFilter;
    }

    // basic pagination — avoids returning unbounded results as the log grows
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter).sort({ created_at: -1 }).skip(skip).limit(limit),
      AuditLog.countDocuments(filter),
    ]);

    return res.json({
      logs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal server error' });
  }
}