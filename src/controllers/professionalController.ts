import type { Request, Response, NextFunction } from 'express';
import { db } from '../config/database';
import { createError } from '../middleware/errorHandler';
import type {
  Professional,
  ProfessionalWithSaved,
  ListProfessionalsQuery,
} from '../models/types';

export async function listProfessionals(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const {
      specialization,
      delivery_method,
      location,
      nhs_funded,
      profession_type,
      accepting_only,
      limit: limitStr,
      offset: offsetStr,
    } = req.query as ListProfessionalsQuery;

    const limit = Math.min(parseInt(limitStr ?? '20'), 50);
    const offset = parseInt(offsetStr ?? '0') || 0;

    const conditions: string[] = ['p.is_active = true'];
    const params: unknown[] = [userId];
    let paramIdx = 2;

    if (specialization) {
      conditions.push(`$${paramIdx} = ANY(p.specializations)`);
      params.push(specialization);
      paramIdx++;
    }
    if (delivery_method) {
      conditions.push(`p.delivery_method = $${paramIdx}`);
      params.push(delivery_method);
      paramIdx++;
    }
    if (location) {
      conditions.push(`p.location ILIKE $${paramIdx}`);
      params.push(`%${location}%`);
      paramIdx++;
    }
    if (nhs_funded !== undefined) {
      conditions.push(`p.nhs_funded = $${paramIdx}`);
      params.push(nhs_funded === 'true');
      paramIdx++;
    }
    if (profession_type) {
      conditions.push(`p.profession_type = $${paramIdx}`);
      params.push(profession_type);
      paramIdx++;
    }
    if (accepting_only === 'true') {
      conditions.push('p.accepting_clients = true');
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [dataResult, countResult] = await Promise.all([
      db.query<ProfessionalWithSaved>(
        `SELECT p.*,
                (sp.id IS NOT NULL) AS is_saved
         FROM professionals p
         LEFT JOIN saved_professionals sp
           ON sp.professional_id = p.id AND sp.user_id = $1
         ${where}
         ORDER BY p.accepting_clients DESC, p.name ASC
         LIMIT ${limit} OFFSET ${offset}`,
        params
      ),
      db.query<{ count: string }>(
        `SELECT COUNT(*) FROM professionals p ${where}`,
        params
      ),
    ]);

    res.json({
      professionals: dataResult.rows,
      total: parseInt(countResult.rows[0].count),
      limit,
      offset,
    });
  } catch (err) {
    next(err);
  }
}

export async function getProfessional(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const result = await db.query<ProfessionalWithSaved>(
      `SELECT p.*,
              (sp.id IS NOT NULL) AS is_saved
       FROM professionals p
       LEFT JOIN saved_professionals sp
         ON sp.professional_id = p.id AND sp.user_id = $2
       WHERE p.id = $1 AND p.is_active = true`,
      [id, userId]
    );

    if (!result.rows.length) throw createError('Professional not found', 404);

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function saveProfessional(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const pro = await db.query<Pick<Professional, 'id'>>(
      'SELECT id FROM professionals WHERE id = $1 AND is_active = true',
      [id]
    );
    if (!pro.rows.length) throw createError('Professional not found', 404);

    await db.query(
      `INSERT INTO saved_professionals (user_id, professional_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, professional_id) DO NOTHING`,
      [userId, id]
    );

    res.status(201).json({ message: 'Professional saved' });
  } catch (err) {
    next(err);
  }
}

export async function unsaveProfessional(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const result = await db.query(
      'DELETE FROM saved_professionals WHERE user_id = $1 AND professional_id = $2 RETURNING id',
      [userId, id]
    );

    if (!result.rowCount) throw createError('Saved professional not found', 404);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function getSavedProfessionals(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;

    const result = await db.query<Professional & { saved_at: Date }>(
      `SELECT p.*, sp.created_at AS saved_at
       FROM saved_professionals sp
       JOIN professionals p ON p.id = sp.professional_id
       WHERE sp.user_id = $1 AND p.is_active = true
       ORDER BY sp.created_at DESC`,
      [userId]
    );

    res.json({ professionals: result.rows });
  } catch (err) {
    next(err);
  }
}
