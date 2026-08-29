import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { createWebhook, listWebhooks, deleteWebhook } from '../controller/webhook.controller';
import { protectedCors } from '../middleware/cors.middleware';

const router = Router();

router.post('/', protectedCors, requireAuth, requirePermission('settings:manage'), createWebhook);
router.get('/', protectedCors, requireAuth, requirePermission('settings:manage'), listWebhooks);
router.delete('/:id', protectedCors, requireAuth, requirePermission('settings:manage'), deleteWebhook);

export default router;