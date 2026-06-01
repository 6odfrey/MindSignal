import type { Request, Response, NextFunction } from 'express';
import { db } from '../config/database';
import { createError } from '../middleware/errorHandler';
import type {
  Conversation,
  ConversationWithDetails,
  Message,
  SendMessageBody,
} from '../models/types';

export async function startConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { professional_id } = req.body as { professional_id: string };

    const pro = await db.query(
      'SELECT id FROM professionals WHERE id = $1 AND is_active = true',
      [professional_id]
    );
    if (!pro.rows.length) throw createError('Professional not found', 404);

    const result = await db.query<Conversation>(
      `INSERT INTO conversations (user_id, professional_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, professional_id) DO UPDATE SET user_id = EXCLUDED.user_id
       RETURNING *`,
      [userId, professional_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function listConversations(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;

    const result = await db.query<ConversationWithDetails>(
      `SELECT
         c.id,
         c.user_id,
         c.professional_id,
         c.last_message_at,
         c.created_at,
         p.name                                              AS professional_name,
         p.profession_type                                   AS professional_type,
         COUNT(m.id) FILTER (WHERE m.read_at IS NULL
           AND m.sender_type = 'professional')::int         AS unread_count,
         (SELECT content FROM messages
          WHERE conversation_id = c.id
          ORDER BY created_at DESC LIMIT 1)                 AS last_message
       FROM conversations c
       JOIN professionals p ON p.id = c.professional_id
       LEFT JOIN messages m ON m.conversation_id = c.id
       WHERE c.user_id = $1
       GROUP BY c.id, p.name, p.profession_type
       ORDER BY COALESCE(c.last_message_at, c.created_at) DESC`,
      [userId]
    );

    res.json({ conversations: result.rows });
  } catch (err) {
    next(err);
  }
}

export async function getConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const conv = await db.query<Conversation>(
      'SELECT * FROM conversations WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    if (!conv.rows.length) throw createError('Conversation not found', 404);

    // Mark incoming messages as read
    await db.query(
      `UPDATE messages SET read_at = NOW()
       WHERE conversation_id = $1 AND sender_type = 'professional' AND read_at IS NULL`,
      [id]
    );

    const [msgResult, countResult] = await Promise.all([
      db.query<Message>(
        `SELECT * FROM messages WHERE conversation_id = $1
         ORDER BY created_at ASC LIMIT $2 OFFSET $3`,
        [id, limit, offset]
      ),
      db.query<{ count: string }>(
        'SELECT COUNT(*) FROM messages WHERE conversation_id = $1',
        [id]
      ),
    ]);

    res.json({
      conversation: conv.rows[0],
      messages: msgResult.rows,
      total: parseInt(countResult.rows[0].count),
      limit,
      offset,
    });
  } catch (err) {
    next(err);
  }
}

export async function sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const { content } = req.body as SendMessageBody;

    const conv = await db.query<Conversation>(
      'SELECT * FROM conversations WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    if (!conv.rows.length) throw createError('Conversation not found', 404);

    const [msgResult] = await Promise.all([
      db.query<Message>(
        `INSERT INTO messages (conversation_id, sender_type, content)
         VALUES ($1, 'user', $2) RETURNING *`,
        [id, content.trim()]
      ),
      db.query(
        'UPDATE conversations SET last_message_at = NOW() WHERE id = $1',
        [id]
      ),
    ]);

    res.status(201).json(msgResult.rows[0]);
  } catch (err) {
    next(err);
  }
}
