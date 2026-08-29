import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { createApiKey, listApiKeys, revokeApiKey } from '../controller/apiKey.controller';


const router = Router();

router.post('/', requireAuth, requirePermission('settings:manage'), createApiKey);
router.get('/', requireAuth, requirePermission('settings:manage'), listApiKeys);
router.delete('/:id', requireAuth, requirePermission('settings:manage'), revokeApiKey);

export default router;