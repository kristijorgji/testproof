'use server';

import { createHash, randomBytes } from 'node:crypto';

import { apiTokens, repos } from '@testproof/db';
import { and, desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { getDb } from '@/server/db';
import { requireUser } from '@/server/session';

export type ApiTokenListItem = {
    id: string;
    name: string;
    createdAt: Date;
    lastUsedAt: Date | null;
};

export async function listProjectApiTokens(projectId: string): Promise<ApiTokenListItem[]> {
    await requireUser();
    return getDb()
        .select({
            id: apiTokens.id,
            name: apiTokens.name,
            createdAt: apiTokens.createdAt,
            lastUsedAt: apiTokens.lastUsedAt,
        })
        .from(apiTokens)
        .where(eq(apiTokens.projectId, projectId))
        .orderBy(desc(apiTokens.createdAt));
}

export async function saveRepo(projectId: string, formData: FormData): Promise<void> {
    await requireUser();
    const owner = String(formData.get('owner') ?? '').trim();
    const name = String(formData.get('name') ?? '').trim();
    if (!owner || !name) throw new Error('Owner and repository name are required');
    const db = getDb();
    const existing = await db.select().from(repos).where(eq(repos.projectId, projectId)).limit(1);
    if (existing[0]) {
        await db.update(repos).set({ owner, name, updatedAt: new Date() }).where(eq(repos.id, existing[0].id));
    } else {
        await db.insert(repos).values({ projectId, owner, name });
    }
    revalidatePath(`/projects/${projectId}/settings`);
}

export async function createApiToken(projectId: string, formData: FormData): Promise<{ token: string }> {
    await requireUser();
    const name = String(formData.get('name') ?? '').trim() || 'CI';
    const token = `tp_${randomBytes(24).toString('hex')}`;
    const hash = createHash('sha256').update(token).digest('hex');
    await getDb().insert(apiTokens).values({ projectId, name, hash });
    revalidatePath(`/projects/${projectId}/settings`);
    return { token };
}

export async function deleteApiToken(projectId: string, tokenId: string): Promise<void> {
    await requireUser();
    await getDb()
        .delete(apiTokens)
        .where(and(eq(apiTokens.id, tokenId), eq(apiTokens.projectId, projectId)));
    revalidatePath(`/projects/${projectId}/settings`);
}
