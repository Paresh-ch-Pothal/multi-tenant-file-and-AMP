import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { createWebhook, listWebhooks, deleteWebhook } from '../controller/webhook.controller';

const router = Router();

router.post('/', requireAuth, requirePermission('settings:manage'), createWebhook);
router.get('/', requireAuth, requirePermission('settings:manage'), listWebhooks);
router.delete('/:id', requireAuth, requirePermission('settings:manage'), deleteWebhook);

export default router;