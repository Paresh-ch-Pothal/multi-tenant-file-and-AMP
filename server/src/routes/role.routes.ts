import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { createRole, deleteRole, listRoles, updateRole } from '../controller/role.controller';
import { protectedCors } from '../middleware/cors.middleware';


const router = Router();

router.post('/', protectedCors, requireAuth, requirePermission('user:manage'), createRole);
router.get('/', protectedCors, requireAuth, requirePermission('user:manage'), listRoles);

router.patch('/:id', protectedCors, requireAuth, requirePermission('user:manage'), updateRole);
router.delete('/:id', protectedCors, requireAuth, requirePermission('user:manage'), deleteRole);

export default router;