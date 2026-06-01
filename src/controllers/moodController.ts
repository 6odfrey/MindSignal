import type { Request, Response, NextFunction } from 'express';
import { db } from '../config/database';
import { detectCrisis } from '../utils/crisisDetection';
import { createError } from '../middleware/errorHandler';
import type { Mood, CrisisResource, CreateMoodBody, MoodAnalytics } from '../models/types';

export async function createMood(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { score, note, tags = [] } = req.body as CreateMoodBody;
    const userId = req.user!.userId;

    const crisis_flagged = detectCrisis(note ?? '');

    const result = await db.query<Mood>(
      `INSERT INTO moods (user_id, score, note, tags, crisis_flagged)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, score, note ?? null, tags, crisis_flagged]
    );
    const mood = result.rows[0];

    // If crisis detected, fetch and return UK resources
    let crisis_resources: CrisisResource[] = [];
    if (crisis_flagged) {
      const resourceResult = await db.query<CrisisResource>(
        'SELECT * FROM crisis_resources ORDER BY name'
      );
      crisis_resources = resourceResult.rows;
    }

    res.status(201).json({
      mood,
      ...(crisis_flagged && {
        crisis_alert: {
          message: "We noticed you may be struggling. You're not alone — please reach out for support.",
          resources: crisis_resources,
        },
      }),
    });
  } catch (err) {
    next(err);
  }
}

export async function getMoods(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const [dataResult, countResult] = await Promise.all([
      db.query<Mood>(
        `SELECT * FROM moods WHERE user_id = $1
         ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      ),
      db.query<{ count: string }>(
        'SELECT COUNT(*) FROM moods WHERE user_id = $1',
        [userId]
      ),
    ]);

    res.json({
      moods: dataResult.rows,
      total: parseInt(countResult.rows[0].count),
      limit,
      offset,
    });
  } catch (err) {
    next(err);
  }
}

export async function getMoodAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const days = Math.min(parseInt(req.query.days as string) || 30, 90);

    const [summaryResult, dailyResult] = await Promise.all([
      db.query<{
        total_entries: string;
        average_score: string;
        highest_score: number;
        lowest_score: number;
        crisis_flags: string;
        recent_avg: string;
        older_avg: string;
      }>(
        `SELECT
           COUNT(*)                                                       AS total_entries,
           ROUND(AVG(score)::numeric, 2)                                  AS average_score,
           MAX(score)                                                     AS highest_score,
           MIN(score)                                                     AS lowest_score,
           COUNT(*) FILTER (WHERE crisis_flagged = true)                  AS crisis_flags,
           ROUND(AVG(score) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::numeric, 2) AS recent_avg,
           ROUND(AVG(score) FILTER (WHERE created_at < NOW() - INTERVAL '7 days'
                                    AND created_at >= NOW() - ($2 || ' days')::INTERVAL)::numeric, 2) AS older_avg
         FROM moods
         WHERE user_id = $1 AND created_at >= NOW() - ($2 || ' days')::INTERVAL`,
        [userId, days]
      ),
      db.query<{ date: string; avg_score: string }>(
        `SELECT
           DATE(created_at AT TIME ZONE 'UTC') AS date,
           ROUND(AVG(score)::numeric, 2)        AS avg_score
         FROM moods
         WHERE user_id = $1 AND created_at >= NOW() - ($2 || ' days')::INTERVAL
         GROUP BY DATE(created_at AT TIME ZONE 'UTC')
         ORDER BY date ASC`,
        [userId, days]
      ),
    ]);

    const s = summaryResult.rows[0];
    const recentAvg = parseFloat(s.recent_avg);
    const olderAvg = parseFloat(s.older_avg);

    let trend: MoodAnalytics['trend'] = 'stable';
    if (!isNaN(recentAvg) && !isNaN(olderAvg)) {
      if (recentAvg - olderAvg >= 0.5) trend = 'improving';
      else if (olderAvg - recentAvg >= 0.5) trend = 'declining';
    }

    const analytics: MoodAnalytics = {
      total_entries: parseInt(s.total_entries),
      average_score: parseFloat(s.average_score),
      highest_score: s.highest_score,
      lowest_score: s.lowest_score,
      crisis_flags: parseInt(s.crisis_flags),
      trend,
      daily_averages: dailyResult.rows.map((r) => ({
        date: r.date,
        avg_score: parseFloat(r.avg_score),
      })),
    };

    res.json(analytics);
  } catch (err) {
    next(err);
  }
}

export async function deleteMood(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const result = await db.query(
      'DELETE FROM moods WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (!result.rowCount) throw createError('Mood entry not found', 404);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
