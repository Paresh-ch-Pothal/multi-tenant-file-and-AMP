import { Router } from 'express';
import { bootstrapTenant } from '../controller/tennant.controller';
import { authLimiter } from '../middleware/rareLimiter.middleware';


const router = Router();

router.post('/bootstrap',authLimiter, bootstrapTenant);

export default router;