import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { env } from './config/env';
import { connectDB } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import moodRoutes from './routes/moods';
import crisisRoutes from './routes/crisis';
import professionalRoutes from './routes/professionals';
import conversationRoutes from './routes/conversations';
import notificationRoutes from './routes/notifications';

const app = express();

app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Auth endpoints: stricter limit to slow brute-force attempts
app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
}));

// General API limit
app.use('/api', rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
}));

// Serve uploaded avatars
app.use('/uploads', express.static(path.resolve(env.uploadDir)));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'mind-signal-api', version: '1.0.0' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/moods', moodRoutes);
app.use('/api/crisis', crisisRoutes);
app.use('/api/professionals', professionalRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/notifications', notificationRoutes);

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Central error handler (must be last)
app.use(errorHandler);

async function start(): Promise<void> {
  await connectDB();
  app.listen(env.port, () => {
    console.log(`Mind Signal API running on http://localhost:${env.port}`);
    console.log(`Environment: ${env.nodeEnv}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
