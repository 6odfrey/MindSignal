import { Router } from 'express';
import { param, query } from 'express-validator';
import {
  listProfessionals,
  getProfessional,
  saveProfessional,
  unsaveProfessional,
  getSavedProfessionals,
} from '../controllers/professionalController';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

const PROFESSION_TYPES = ['therapist', 'counsellor', 'psychologist', 'psychiatrist', 'cbt_therapist', 'life_coach'];
const DELIVERY_METHODS = ['online', 'in_person', 'both'];

const listRules = [
  query('specialization').optional().trim().isLength({ max: 50 }),
  query('delivery_method').optional().isIn(DELIVERY_METHODS).withMessage('Invalid delivery_method'),
  query('location').optional().trim().isLength({ max: 100 }),
  query('nhs_funded').optional().isBoolean().withMessage('nhs_funded must be true or false'),
  query('profession_type').optional().isIn(PROFESSION_TYPES).withMessage('Invalid profession_type'),
  query('accepting_only').optional().isBoolean(),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be 1–50'),
  query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be >= 0'),
];

const idRule = [
  param('id').isUUID().withMessage('Invalid professional ID'),
];

router.use(requireAuth);

router.get('/', validate(listRules), listProfessionals);
router.get('/saved', getSavedProfessionals);
router.get('/:id', validate(idRule), getProfessional);
router.post('/:id/save', validate(idRule), saveProfessional);
router.delete('/:id/save', validate(idRule), unsaveProfessional);

export default router;
