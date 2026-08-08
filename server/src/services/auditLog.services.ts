import { Request } from 'express';
import { Types } from 'mongoose';

import { logger } from '../middleware/requestLogger';
import { AuditAction, AuditLog } from '../models/auditLog';

interface WriteAuditLogParams {
  clientId: Types.ObjectId;
  actor: {
    type: 'user' | 'api_key' | 'public';
    id: Types.ObjectId | null;
    label: string | null;
  };
  action: AuditAction;
  target: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  status: 'success' | 'failure';
  req?: Request;
}

export async function writeAuditLog({
  clientId,
  actor,
  action,
  target,
  metadata = {},
  status,
  req,
}: WriteAuditLogParams): Promise<void> {
  try {
    await AuditLog.create({
      client_id: clientId,
      actor,
      action,
      target,
      metadata,
      status,
      request_id: req?.requestId || null,
      ip_address: req?.ip || null,
      created_at: new Date(),
    });
  } catch (err) {
    // never let audit logging fail the main request
    logger.error({ err, action }, 'audit log write failed');
  }
}