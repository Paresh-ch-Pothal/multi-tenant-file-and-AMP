import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { listAuditLogs } from '../controller/auditLog.controller';


const router = Router();

router.get('/audit-logs', requireAuth, requirePermission('audit:read'), listAuditLogs);

export default router;