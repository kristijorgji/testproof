'use server';

import type { LedgerPatch } from '@testproof/core';
import { drafts } from '@testproof/db';
import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { getDb } from '@/server/db';
import { getLedgerSource, PublishConflictError } from '@/server/ledger-source';
import { applyDraft, getOpenDraft, getProject, readProjectLedger } from '@/server/project';
import { requireUser } from '@/server/session';

function revalidateFlows(projectId: string): void {
    revalidatePath(`/projects/${projectId}/flows`);
    revalidatePath(`/projects/${projectId}/coverage`);
}

export async function appendDraftPatch(projectId: string, patch: LedgerPatch): Promise<void> {
    const user = await requireUser();
    const db = getDb();
    const existing = await getOpenDraft(projectId, user.id);
    const ledger = await readProjectLedger(projectId, user.id);
    const project = await getProject(projectId);
    if (!existing) {
        await db.insert(drafts).values({
            projectId,
            branch: project?.defaultBranch ?? 'main',
            authorId: user.id,
            baseBlobSha: ledger.sha,
            patches: [patch],
            status: 'open',
        });
    } else {
        const next = [...(existing.patches as LedgerPatch[]), patch];
        await db
            .update(drafts)
            .set({ patches: next, updatedAt: new Date(), status: 'open' })
            .where(eq(drafts.id, existing.id));
    }
    revalidateFlows(projectId);
}

export async function publishDraft(projectId: string, input: { message: string; pullRequest: boolean }): Promise<void> {
    const user = await requireUser();
    const draft = await getOpenDraft(projectId, user.id);
    const ledger = await readProjectLedger(projectId, user.id);
    const patches = (draft?.patches as LedgerPatch[] | undefined) ?? [];
    const yaml = applyDraft(ledger.content, patches);
    const project = await getProject(projectId);
    if (!project) throw new Error('Project not found');

    const source = await getLedgerSource(projectId, user.id);
    if (input.pullRequest && !source.canPullRequest) {
        throw new Error('Pull requests are only available for git storage');
    }
    try {
        await source.write(yaml, { message: input.message, pullRequest: input.pullRequest });
        if (draft) {
            await getDb()
                .update(drafts)
                .set({ status: 'published', updatedAt: new Date() })
                .where(eq(drafts.id, draft.id));
        }
    } catch (error) {
        if (error instanceof PublishConflictError && draft) {
            await getDb().update(drafts).set({ status: 'stale', updatedAt: new Date() }).where(eq(drafts.id, draft.id));
        } else {
            throw error;
        }
    }
    revalidateFlows(projectId);
}

export async function replayDraft(projectId: string): Promise<void> {
    const user = await requireUser();
    const draft = await getOpenDraft(projectId, user.id);
    if (!draft) return;
    const ledger = await readProjectLedger(projectId, user.id);
    applyDraft(ledger.content, (draft.patches as LedgerPatch[]) ?? []);
    await getDb()
        .update(drafts)
        .set({ status: 'open', baseBlobSha: ledger.sha, updatedAt: new Date() })
        .where(and(eq(drafts.id, draft.id)));
    revalidateFlows(projectId);
}

export async function discardDraft(projectId: string): Promise<void> {
    const user = await requireUser();
    const draft = await getOpenDraft(projectId, user.id);
    if (!draft) return;
    await getDb().update(drafts).set({ status: 'discarded', updatedAt: new Date() }).where(eq(drafts.id, draft.id));
    revalidateFlows(projectId);
}
