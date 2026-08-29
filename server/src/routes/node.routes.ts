import express from 'express'
import { createFolder, createUploadToken, deleteNode, getFileDownloadUrl, listNodes, renameNode, togglePublicUpload, updateNodeMetadata, uploadFile, uploadThumbnail } from '../controller/node.controller'
import { optionalAuth, requireAuth } from '../middleware/auth.middleware'
import { requirePermission } from '../middleware/rbac.middleware'
import { upload } from '../middleware/upload.middleware'
import { requireAuthOrApiKey } from '../middleware/combinedAuth.middleware'
import { publicUploadLimiter, uploadTokenLimiter } from '../middleware/rareLimiter.middleware'
import cors from 'cors';
import { protectedCors, publicCors } from '../middleware/cors.middleware'


const router = express.Router()


router.post('/upload', publicCors, publicUploadLimiter, optionalAuth, upload.single('file'), uploadFile);
router.post("/createFolder", protectedCors, requireAuth, requirePermission('node:create_folder'), createFolder)


router.get("/", protectedCors, requireAuthOrApiKey, requirePermission('node:read'), listNodes)

router.patch('/:id', protectedCors, requireAuth, requirePermission('node:edit'), renameNode);

router.delete('/:id', protectedCors, requireAuth, requirePermission('node:delete'), deleteNode);
router.patch('/:id/metadata', protectedCors, requireAuth, requirePermission('node:edit'), updateNodeMetadata);
router.post('/:id/thumbnail', protectedCors, requireAuth, requirePermission('node:edit'), upload.single('thumbnail'), uploadThumbnail);
router.patch('/:id/public-upload', protectedCors, requireAuth, requirePermission('node:edit'), togglePublicUpload);

router.post('/:id/upload-token', publicCors, uploadTokenLimiter, requireAuthOrApiKey, createUploadToken);

router.get('/:id/download-url', protectedCors, requireAuth, requirePermission('node:read'), getFileDownloadUrl);

export default router;
