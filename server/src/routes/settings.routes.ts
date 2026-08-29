import { Router } from 'express';
import { optionalAuth } from '../middleware/auth.middleware';
import { requireAuth } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { getSettings, updateSettings } from '../controller/settings.controller';
import { protectedCors } from '../middleware/cors.middleware';


const router = Router();

router.get('/', protectedCors, optionalAuth, getSettings);
router.patch('/', protectedCors, requireAuth, requirePermission('settings:manage'), updateSettings);

export default router;