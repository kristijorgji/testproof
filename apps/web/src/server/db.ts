import { createDb, type Database } from '@testproof/db';

let cached: Database | undefined;

export function getDb(): Database {
    cached ??= createDb(process.env.DATABASE_URL);
    return cached;
}
