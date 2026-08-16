import { Router } from 'express';
import { requireAuthOrApiKey } from '../middleware/combinedAuth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { getCatalogNode, listCatalogNodes } from '../controller/catalog.controller';
import cors from 'cors';


const router = Router();

const publicUploadCors = cors({
  origin: '*',
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
});

router.get('/',publicUploadCors ,requireAuthOrApiKey, listCatalogNodes);
router.get('/:id',publicUploadCors, requireAuthOrApiKey, getCatalogNode);

export default router;