import express from 'express'
import { createFolder, createUploadToken, deleteNode, listNodes, renameNode, togglePublicUpload, updateNodeMetadata, uploadFile, uploadThumbnail } from '../controller/node.controller'
import { optionalAuth, requireAuth } from '../middleware/auth.middleware'
import { requirePermission } from '../middleware/rbac.middleware'
import { upload } from '../middleware/upload.middleware'
import { requireAuthOrApiKey } from '../middleware/combinedAuth.middleware'


const router = express.Router()

router.post('/upload', optionalAuth, upload.single('file'), uploadFile);
router.post("/createFolder",requireAuth,requirePermission('node:create_folder'),createFolder)


router.get("/",requireAuthOrApiKey,requirePermission('node:read'),listNodes)

router.patch('/:id', requireAuth, requirePermission('node:edit'),renameNode);

router.delete('/:id', requireAuth, requirePermission('node:delete'), deleteNode);
router.patch('/:id/metadata', requireAuth, requirePermission('node:edit'), updateNodeMetadata);
router.post('/:id/thumbnail', requireAuth, requirePermission('node:edit'), upload.single('thumbnail'), uploadThumbnail);
router.patch('/:id/public-upload', requireAuth, requirePermission('node:edit'), togglePublicUpload);

router.post('/:id/upload-token', requireAuthOrApiKey, requirePermission('node:read'), createUploadToken);

export default router;
