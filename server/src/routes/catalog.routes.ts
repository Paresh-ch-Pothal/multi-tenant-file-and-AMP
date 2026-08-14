import { Router } from 'express';
import { requireAuthOrApiKey } from '../middleware/combinedAuth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { getCatalogNode, listCatalogNodes } from '../controller/catalog.controller';


const router = Router();

router.get('/', requireAuthOrApiKey, requirePermission('node:read'), listCatalogNodes);
router.get('/:id', requireAuthOrApiKey, requirePermission('node:read'), getCatalogNode);

export default router;