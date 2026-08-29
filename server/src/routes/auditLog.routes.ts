import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { listAuditLogs } from '../controller/auditLog.controller';
import { protectedCors } from '../middleware/cors.middleware';


const router = Router();

router.get('/', protectedCors, requireAuth, requirePermission('audit:read'), listAuditLogs);

export default router;