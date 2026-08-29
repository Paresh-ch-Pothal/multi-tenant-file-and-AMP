import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { createRole, deleteRole, listRoles, updateRole } from '../controller/role.controller';


const router = Router();

router.post('/', requireAuth, requirePermission('user:manage'), createRole);
router.get('/', requireAuth, requirePermission('user:manage'), listRoles);

router.patch('/:id', requireAuth, requirePermission('user:manage'), updateRole);
router.delete('/:id', requireAuth, requirePermission('user:manage'), deleteRole);

export default router;