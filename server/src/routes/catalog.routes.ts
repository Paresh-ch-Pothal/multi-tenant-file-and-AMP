import { Router } from 'express';
import { requireAuthOrApiKey } from '../middleware/combinedAuth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { getCatalogNode, listCatalogNodes } from '../controller/catalog.controller';
import cors from 'cors';
import { publicCors } from '../middleware/cors.middleware';


const router = Router();


router.get('/', publicCors, requireAuthOrApiKey, listCatalogNodes);
router.get('/:id', publicCors, requireAuthOrApiKey, getCatalogNode);

export default router;