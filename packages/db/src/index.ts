import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema.js';

export * from './schema.js';
export { schema };

export type Database = PostgresJsDatabase<typeof schema>;

export function createDb(url = process.env.DATABASE_URL): Database {
    if (!url) throw new Error('DATABASE_URL is required');
    const client = postgres(url, { max: 10 });
    return drizzle(client, { schema });
}
