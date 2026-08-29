import { Router } from 'express';
import { optionalAuth } from '../middleware/auth.middleware';
import { requireAuth } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { getSettings, updateSettings } from '../controller/settings.controller';


const router = Router();

router.get('/', optionalAuth, getSettings);
router.patch('/', requireAuth, requirePermission('settings:manage'), updateSettings);

export default router;