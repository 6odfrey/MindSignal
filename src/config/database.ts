import { Pool } from 'pg';
import { env } from './env';

export const db = new Pool({
  connectionString: env.databaseUrl,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

db.on('error', (err) => {
  console.error('Unexpected database client error:', err);
  process.exit(1);
});

export async function connectDB(): Promise<void> {
  const client = await db.connect();
  client.release();
  console.log('Database connected');
}
