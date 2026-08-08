import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { createRole, listRoles } from '../controller/role.controller';


const router = Router();

router.post('/', requireAuth, requirePermission('user:manage'), createRole);
router.get('/', requireAuth, requirePermission('user:manage'), listRoles);

export default router;