import { Router } from 'express';
import { googleLogin } from '../controller/auth.controller';
import { authLimiter } from '../middleware/rareLimiter.middleware';


const router = Router();

router.post('/google',authLimiter, googleLogin);

export default router;