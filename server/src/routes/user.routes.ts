import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { deleteUser, inviteUser, listUsers, updateUser } from '../controller/user.controller';


const router = Router();

router.post('/invite', requireAuth, requirePermission('user:manage'), inviteUser);
router.get('/', requireAuth, requirePermission('user:manage'), listUsers);
router.patch('/:id', requireAuth, requirePermission('user:manage'), updateUser);
router.delete('/:id', requireAuth, requirePermission('user:manage'), deleteUser);

export default router;