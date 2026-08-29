import { Router } from 'express';
import { bootstrapTenant } from '../controller/tennant.controller';
import { authLimiter } from '../middleware/rareLimiter.middleware';
import { protectedCors } from '../middleware/cors.middleware';


const router = Router();

router.post('/bootstrap', protectedCors, authLimiter, bootstrapTenant);

export default router;