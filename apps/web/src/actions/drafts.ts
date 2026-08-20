'use server';

import { applyPatches, openLedgerDocument, serializeLedgerDocument, type LedgerPatch } from '@testproof/core';
import { drafts } from '@testproof/db';
import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { getDb } from '@/server/db';

export async function appendDraftPatch(projectId: string, branch: string, authorId: string, patch: LedgerPatch): Promise<void> {
    const db = getDb();
    const existing = await db
        .select()
        .from(drafts)
        .where(and(eq(drafts.projectId, projectId), eq(drafts.branch, branch), eq(drafts.authorId, authorId), eq(drafts.status, 'open')))
        .limit(1);
    const current = existing[0];
    if (!current) {
        await db.insert(drafts).values({
            projectId,
            branch,
            authorId,
            baseBlobSha: 'unknown',
            patches: [patch],
            status: 'open',
        });
    } else {
        const next = [...(current.patches as LedgerPatch[]), patch];
        await db.update(drafts).set({ patches: next, updatedAt: new Date() }).where(eq(drafts.id, current.id));
    }
    revalidatePath(`/projects/${projectId}/flows`);
}

export function previewPatchedYaml(source: string, patches: LedgerPatch[]): string {
    const doc = openLedgerDocument(source);
    applyPatches(doc, patches);
    return serializeLedgerDocument(doc);
}
