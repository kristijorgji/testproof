import { createHash } from 'node:crypto';

import { apiTokens } from '@testproof/db';
import { eq } from 'drizzle-orm';
import type { Context, Next } from 'hono';

import { getDb } from '../../db';

export async function requireProjectToken(c: Context, next: Next): Promise<Response | void> {
    const header = c.req.header('authorization') ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) return c.json({ error: 'missing token' }, 401);
    const hash = createHash('sha256').update(token).digest('hex');
    const db = getDb();
    const rows = await db.select().from(apiTokens).where(eq(apiTokens.hash, hash)).limit(1);
    const row = rows[0];
    if (!row) return c.json({ error: 'invalid token' }, 401);
    await db.update(apiTokens).set({ lastUsedAt: new Date() }).where(eq(apiTokens.id, row.id));
    c.set('projectId', row.projectId);
    await next();
}
