import { applyPatches, type LedgerPatch, openLedgerDocument, serializeLedgerDocument } from '@testproof/core';
import { drafts, projects, repos } from '@testproof/db';
import { and, desc, eq } from 'drizzle-orm';

import { getDb } from './db';
import { getLedgerSource } from './ledger-source';

export async function getProject(projectId: string): Promise<typeof projects.$inferSelect | undefined> {
    const [project] = await getDb().select().from(projects).where(eq(projects.id, projectId)).limit(1);
    return project;
}

export async function getProjectRepo(projectId: string): Promise<typeof repos.$inferSelect | undefined> {
    const [repo] = await getDb().select().from(repos).where(eq(repos.projectId, projectId)).limit(1);
    return repo;
}

export async function getOpenDraft(projectId: string, userId: string): Promise<typeof drafts.$inferSelect | undefined> {
    const [draft] = await getDb()
        .select()
        .from(drafts)
        .where(and(eq(drafts.projectId, projectId), eq(drafts.authorId, userId), eq(drafts.status, 'open')))
        .orderBy(desc(drafts.updatedAt))
        .limit(1);
    const [stale] = draft
        ? [draft]
        : await getDb()
              .select()
              .from(drafts)
              .where(and(eq(drafts.projectId, projectId), eq(drafts.authorId, userId), eq(drafts.status, 'stale')))
              .orderBy(desc(drafts.updatedAt))
              .limit(1);
    return draft ?? stale;
}

export async function readProjectLedger(
    projectId: string,
    userId: string,
): Promise<{ content: string; sha: string; fromGithub: boolean; revision: number }> {
    const source = await getLedgerSource(projectId, userId);
    const file = await source.read();
    return { ...file, fromGithub: source.kind === 'git' };
}

export function applyDraft(source: string, patches: LedgerPatch[]): string {
    const doc = openLedgerDocument(source);
    applyPatches(doc, patches);
    return serializeLedgerDocument(doc);
}
