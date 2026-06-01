import { Router } from 'express';
import { body } from 'express-validator';
import {
  registerToken,
  getPreferences,
  updatePreferences,
} from '../controllers/notificationController';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.use(requireAuth);

router.post(
  '/token',
  validate([
    body('token').trim().notEmpty().withMessage('Token is required'),
    body('platform').isIn(['ios', 'android', 'web']).withMessage('Invalid platform'),
  ]),
  registerToken
);

router.get('/preferences', getPreferences);

router.put(
  '/preferences',
  validate([
    body('mood_reminder').optional().isBoolean(),
    body('reminder_time')
      .optional()
      .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
      .withMessage('reminder_time must be HH:MM format'),
    body('crisis_alerts').optional().isBoolean(),
    body('message_alerts').optional().isBoolean(),
  ]),
  updatePreferences
);

export default router;
