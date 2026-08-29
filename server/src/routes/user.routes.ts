import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { deleteUser, inviteUser, listUsers, updateUser } from '../controller/user.controller';
import { protectedCors } from '../middleware/cors.middleware';


const router = Router();

router.post('/invite', protectedCors, requireAuth, requirePermission('user:manage'), inviteUser);
router.get('/', protectedCors, requireAuth, requirePermission('user:manage'), listUsers);
router.patch('/:id', protectedCors, requireAuth, requirePermission('user:manage'), updateUser);
router.delete('/:id', protectedCors, requireAuth, requirePermission('user:manage'), deleteUser);

export default router;