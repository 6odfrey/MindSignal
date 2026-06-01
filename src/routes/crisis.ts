import { Router } from 'express';
import { getResources } from '../controllers/crisisController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);
router.get('/resources', getResources);

export default router;
