import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { inviteUser, listUsers } from '../controller/user.controller';


const router = Router();

router.post('/invite', requireAuth, requirePermission('user:manage'), inviteUser);
router.get('/', requireAuth, requirePermission('user:manage'), listUsers);

export default router;