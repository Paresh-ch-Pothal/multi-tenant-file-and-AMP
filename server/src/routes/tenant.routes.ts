import { Router } from 'express';
import { bootstrapTenant } from '../controller/tennant.controller';


const router = Router();

router.post('/bootstrap', bootstrapTenant);

export default router;