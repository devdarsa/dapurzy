import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

// Cloudflare D1 Database Binding Interface Definition
export interface D1Database {
  prepare(query: string): any;
  dump(): Promise<ArrayBuffer>;
  batch<T = unknown>(statements: any[]): Promise<any[]>;
  exec(query: string): Promise<any>;
}

export interface Env {
  DB: D1Database;
}

/**
 * Returns Drizzle ORM client connected to Cloudflare D1 database
 * @param env Cloudflare Worker environment containing DB binding
 */
export function getDb(env?: Env) {
  if (env?.DB) {
    return drizzle(env.DB as any, { schema });
  }
  throw new Error('Cloudflare D1 Database binding [DB] is not provided.');
}

export { schema };
