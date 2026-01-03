// lib/db.ts
import { neon } from '@neondatabase/serverless';

export const sql = neon(process.env.DATABASE_URL!);

export async function query(text: string, params?: any[]) {
  return sql(text, params);
}