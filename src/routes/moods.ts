import { Router } from 'express';
import { body, query } from 'express-validator';
import { createMood, getMoods, getMoodAnalytics, deleteMood } from '../controllers/moodController';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

const createMoodRules = [
  body('score')
    .isInt({ min: 1, max: 10 })
    .withMessage('Score must be an integer between 1 and 10'),
  body('note')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Note max 1000 characters'),
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Tags must be an array of up to 10 items'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Each tag max 30 characters'),
];

const listMoodRules = [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
  query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be >= 0'),
];

const analyticRules = [
  query('days').optional().isInt({ min: 1, max: 90 }).withMessage('Days must be 1-90'),
];

router.use(requireAuth);

router.post('/', validate(createMoodRules), createMood);
router.get('/', validate(listMoodRules), getMoods);
router.get('/analytics', validate(analyticRules), getMoodAnalytics);
router.delete('/:id', deleteMood);

export default router;
