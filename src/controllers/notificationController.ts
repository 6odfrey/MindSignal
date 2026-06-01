import type { Request, Response, NextFunction } from 'express';
import { db } from '../config/database';
import type {
  NotificationPreferences,
  UpdateNotificationPrefsBody,
  RegisterTokenBody,
} from '../models/types';

export async function registerToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { token, platform } = req.body as RegisterTokenBody;

    await db.query(
      `INSERT INTO device_tokens (user_id, token, platform)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, token) DO UPDATE SET updated_at = NOW()`,
      [userId, token, platform]
    );

    res.status(201).json({ message: 'Token registered' });
  } catch (err) {
    next(err);
  }
}

export async function getPreferences(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;

    const result = await db.query<NotificationPreferences>(
      `INSERT INTO notification_preferences (user_id)
       VALUES ($1)
       ON CONFLICT (user_id) DO UPDATE SET user_id = EXCLUDED.user_id
       RETURNING *`,
      [userId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function updatePreferences(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { mood_reminder, reminder_time, crisis_alerts, message_alerts } =
      req.body as UpdateNotificationPrefsBody;

    const fields: string[] = [];
    const params: unknown[] = [userId];
    let idx = 2;

    if (mood_reminder !== undefined) { fields.push(`mood_reminder = $${idx++}`); params.push(mood_reminder); }
    if (reminder_time !== undefined) { fields.push(`reminder_time = $${idx++}`); params.push(reminder_time); }
    if (crisis_alerts !== undefined) { fields.push(`crisis_alerts = $${idx++}`); params.push(crisis_alerts); }
    if (message_alerts !== undefined) { fields.push(`message_alerts = $${idx++}`); params.push(message_alerts); }

    if (!fields.length) {
      res.status(422).json({ error: 'No fields to update' });
      return;
    }

    const result = await db.query<NotificationPreferences>(
      `UPDATE notification_preferences
       SET ${fields.join(', ')}
       WHERE user_id = $1
       RETURNING *`,
      params
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}
