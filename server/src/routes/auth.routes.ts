import { Router } from 'express';
import { googleLogin } from '../controller/auth.controller';
import { authLimiter } from '../middleware/rareLimiter.middleware';
import { protectedCors } from '../middleware/cors.middleware';


const router = Router();

router.post('/google', protectedCors, authLimiter, googleLogin);

export default router;