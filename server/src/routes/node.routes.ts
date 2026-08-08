import express from 'express'
import { createFolder, deleteNode, listNodes, renameNode, uploadFile } from '../controller/node.controller'
import { optionalAuth, requireAuth } from '../middleware/auth.middleware'
import { requirePermission } from '../middleware/rbac.middleware'
import { upload } from '../middleware/upload.middleware'


const router = express.Router()

router.post('/upload', optionalAuth, upload.single('file'), uploadFile);
router.post("/createFolder",requireAuth,requirePermission('node:create_folder'),createFolder)
router.get("/",requireAuth,requirePermission('node:read'),listNodes)

router.patch('/:id', requireAuth, requirePermission('node:edit'),renameNode);

router.delete('/:id', requireAuth, requirePermission('node:delete'), deleteNode);

export default router;
