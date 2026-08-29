import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { createApiKey, listApiKeys, revokeApiKey } from '../controller/apiKey.controller';
import { protectedCors } from '../middleware/cors.middleware';


const router = Router();

router.post('/', protectedCors, requireAuth, requirePermission('settings:manage'), createApiKey);
router.get('/', protectedCors, requireAuth, requirePermission('settings:manage'), listApiKeys);
router.delete('/:id', protectedCors, requireAuth, requirePermission('settings:manage'), revokeApiKey);

export default router;