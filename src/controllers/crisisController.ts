import type { Request, Response, NextFunction } from 'express';
import { db } from '../config/database';
import type { CrisisResource } from '../models/types';

export async function getResources(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await db.query<CrisisResource>(
      'SELECT * FROM crisis_resources ORDER BY name'
    );
    res.json({ resources: result.rows });
  } catch (err) {
    next(err);
  }
}
