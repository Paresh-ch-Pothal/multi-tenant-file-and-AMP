import { Router } from 'express';
import { googleLogin } from '../controller/auth.controller';


const router = Router();

router.post('/google', googleLogin);

export default router;