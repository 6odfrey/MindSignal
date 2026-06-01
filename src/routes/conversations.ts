import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  startConversation,
  listConversations,
  getConversation,
  sendMessage,
} from '../controllers/conversationController';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.use(requireAuth);

router.post(
  '/',
  validate([
    body('professional_id').isUUID().withMessage('Invalid professional ID'),
  ]),
  startConversation
);

router.get('/', listConversations);

router.get(
  '/:id',
  validate([
    param('id').isUUID().withMessage('Invalid conversation ID'),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 }),
  ]),
  getConversation
);

router.post(
  '/:id/messages',
  validate([
    param('id').isUUID().withMessage('Invalid conversation ID'),
    body('content').trim().notEmpty().withMessage('Message cannot be empty')
      .isLength({ max: 2000 }).withMessage('Message max 2000 characters'),
  ]),
  sendMessage
);

export default router;
