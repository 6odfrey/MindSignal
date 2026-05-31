import type { Request, Response, NextFunction } from 'express';
import { db } from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import { signToken, verifyToken } from '../utils/jwt';
import { createError } from '../middleware/errorHandler';
import type { RegisterBody, LoginBody, User } from '../models/types';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, display_name } = req.body as RegisterBody;

    // Check for existing user
    const existing = await db.query<{ id: string }>(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    if (existing.rowCount && existing.rowCount > 0) {
      throw createError('Email already registered', 409);
    }

    const password_hash = await hashPassword(password);

    // Create user + profile in a transaction
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      const userResult = await client.query<User>(
        `INSERT INTO users (email, password_hash)
         VALUES ($1, $2)
         RETURNING id, email, is_active, created_at, updated_at`,
        [email.toLowerCase(), password_hash]
      );
      const user = userResult.rows[0];

      await client.query(
        `INSERT INTO user_profiles (user_id, display_name)
         VALUES ($1, $2)`,
        [user.id, display_name ?? null]
      );

      await client.query('COMMIT');

      const token = signToken({ userId: user.id, email: user.email });
      res.status(201).json({
        token,
        user: { id: user.id, email: user.email, created_at: user.created_at },
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body as LoginBody;

    const result = await db.query<User>(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email.toLowerCase()]
    );
    const user = result.rows[0];

    if (!user || !(await comparePassword(password, user.password_hash))) {
      throw createError('Invalid email or password', 401);
    }

    const token = signToken({ userId: user.id, email: user.email });
    res.json({
      token,
      user: { id: user.id, email: user.email, created_at: user.created_at },
    });
  } catch (err) {
    next(err);
  }
}

export async function verify(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw createError('Missing authorization header', 401);
    }

    const payload = verifyToken(authHeader.slice(7));
    const result = await db.query<{ id: string; email: string; is_active: boolean }>(
      'SELECT id, email, is_active FROM users WHERE id = $1',
      [payload.userId]
    );
    const user = result.rows[0];

    if (!user || !user.is_active) {
      throw createError('User not found or inactive', 401);
    }

    res.json({ valid: true, userId: user.id, email: user.email });
  } catch (err) {
    next(err);
  }
}
