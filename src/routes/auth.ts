import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, verify } from '../controllers/authController';
import { validate } from '../middleware/validate';

const router = Router();

const registerRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain a number'),
  body('display_name').optional().trim().isLength({ max: 100 }).withMessage('Display name max 100 chars'),
];

const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
];

router.post('/register', validate(registerRules), register);
router.post('/login', validate(loginRules), login);
router.get('/verify', verify);

export default router;
