import { createDb, type Database } from '@testproof/db';

let cached: Database | undefined;

export function getDb(): Database {
    cached ??= createDb(process.env.DATABASE_URL ?? 'postgres://testproof:testproof@127.0.0.1:5432/testproof');
    return cached;
}
