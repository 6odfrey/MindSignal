import { Router } from 'express';
import { body } from 'express-validator';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { getMe, updateMe, uploadAvatar } from '../controllers/userController';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createError } from '../middleware/errorHandler';
import { env } from '../config/env';

const router = Router();

// Multer config: store avatars as UUID-named files
const storage = multer.diskStorage({
  destination: env.uploadDir,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: env.maxFileSizeMb * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(createError('Only JPG, PNG, and WebP images are allowed', 400));
    }
  },
});

const updateProfileRules = [
  body('display_name').optional().trim().isLength({ max: 100 }).withMessage('Display name max 100 chars'),
  body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio max 500 chars'),
  body('timezone').optional().trim().isLength({ max: 50 }).withMessage('Invalid timezone'),
];

router.use(requireAuth);

router.get('/me', getMe);
router.put('/me', validate(updateProfileRules), updateMe);
router.post('/avatar', upload.single('avatar'), uploadAvatar);

export default router;
