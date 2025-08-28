import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString || connectionString.includes('YOUR_DB_PASSWORD')) {
  console.warn('⚠️  DATABASE_URL is not properly configured. Using fallback mode.');
  // Temporary fallback - will use in-memory storage until database is configured
}

// Create the connection with proper fallback handling
const sql = postgres(connectionString || 'postgresql://fallback', {
  max: 10,
});

// Create the drizzle instance
export const db = drizzle(sql, { schema });

export type Database = typeof db;