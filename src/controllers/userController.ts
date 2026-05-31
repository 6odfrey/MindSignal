import type { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { db } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { env } from '../config/env';
import type { User, UserProfile, UpdateProfileBody } from '../models/types';

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await db.query<User & UserProfile>(
      `SELECT
         u.id, u.email, u.is_active, u.created_at, u.updated_at,
         p.display_name, p.bio, p.avatar_url, p.timezone
       FROM users u
       LEFT JOIN user_profiles p ON p.user_id = u.id
       WHERE u.id = $1`,
      [req.user!.userId]
    );

    const row = result.rows[0];
    if (!row) throw createError('User not found', 404);

    res.json({
      id: row.id,
      email: row.email,
      is_active: row.is_active,
      created_at: row.created_at,
      updated_at: row.updated_at,
      profile: {
        display_name: row.display_name,
        bio: row.bio,
        avatar_url: row.avatar_url,
        timezone: row.timezone,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { display_name, bio, timezone } = req.body as UpdateProfileBody;

    // Upsert profile (created at registration but guard anyway)
    const result = await db.query<UserProfile>(
      `INSERT INTO user_profiles (user_id, display_name, bio, timezone)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id) DO UPDATE
         SET display_name = EXCLUDED.display_name,
             bio          = EXCLUDED.bio,
             timezone     = EXCLUDED.timezone
       RETURNING *`,
      [req.user!.userId, display_name ?? null, bio ?? null, timezone ?? 'UTC']
    );

    res.json({ profile: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function uploadAvatar(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) throw createError('No file uploaded', 400);

    const userId = req.user!.userId;

    // Remove old avatar file if it exists on disk
    const existing = await db.query<{ avatar_url: string | null }>(
      'SELECT avatar_url FROM user_profiles WHERE user_id = $1',
      [userId]
    );
    const oldUrl = existing.rows[0]?.avatar_url;
    if (oldUrl && oldUrl.startsWith('/uploads/')) {
      const oldPath = path.join(env.uploadDir, path.basename(oldUrl));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const avatarUrl = `/uploads/${req.file.filename}`;

    await db.query(
      `UPDATE user_profiles SET avatar_url = $1 WHERE user_id = $2`,
      [avatarUrl, userId]
    );

    res.json({ avatar_url: avatarUrl });
  } catch (err) {
    next(err);
  }
}
