import type { CoverageCell, LedgerPatch } from '@testproof/core';
import { applyPatches, ledgerPlatforms, openLedgerDocument, parseLedger, serializeLedgerDocument } from '@testproof/core';
import { coverageSnapshots, flowCoverage } from '@testproof/db';
import { desc, eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';

import { appendDraftPatch, discardDraft, publishDraft, replayDraft } from '@/actions/drafts';
import { FlowEditor } from '@/components/flow-tree/FlowEditor';
import { ProjectNav } from '@/components/layout/ProjectNav';
import { getDb } from '@/server/db';
import { getOpenDraft, getProject, readProjectLedger } from '@/server/project';
import { requireUser } from '@/server/session';

export default async function FlowsPage({ params }: { params: Promise<{ projectId: string }> }) {
    const user = await requireUser();
    const { projectId } = await params;
    const project = await getProject(projectId);
    if (!project) notFound();

    const ledgerFile = await readProjectLedger(projectId, user.id);
    const draft = await getOpenDraft(projectId, user.id);
    const patches = (draft?.patches as LedgerPatch[] | undefined) ?? [];
    const after = (() => {
        const doc = openLedgerDocument(ledgerFile.content);
        applyPatches(doc, patches);
        return serializeLedgerDocument(doc);
    })();
    const ledger = parseLedger(after);

    const coverage: Record<string, { status: 'automated' | 'partial' | 'todo' | 'manual'; demanded: CoverageCell[]; covered: CoverageCell[] }> = {};
    try {
        const [snapshot] = await getDb()
            .select()
            .from(coverageSnapshots)
            .where(eq(coverageSnapshots.projectId, projectId))
            .orderBy(desc(coverageSnapshots.createdAt))
            .limit(1);
        if (snapshot) {
            const rows = await getDb().select().from(flowCoverage).where(eq(flowCoverage.snapshotId, snapshot.id));
            for (const row of rows) {
                coverage[row.flowId] = {
                    status: row.status as 'automated' | 'partial' | 'todo' | 'manual',
                    demanded: (row.demandedCells as CoverageCell[]) ?? [],
                    covered: (row.coveredCells as CoverageCell[]) ?? [],
                };
            }
        }
    } catch {
        /* empty */
    }

    const conflict = draft?.status === 'stale' ? { remote: ledgerFile.content, draft: after } : undefined;

    return (
        <>
            <ProjectNav projectId={projectId} name={project.name} />
            <FlowEditor
                ledger={ledger}
                platforms={ledgerPlatforms(ledger)}
                coverage={coverage}
                beforeYaml={ledgerFile.content}
                afterYaml={after}
                conflict={conflict}
                onPatch={async (patch) => {
                    'use server';
                    await appendDraftPatch(projectId, patch);
                }}
                onPublish={async (input) => {
                    'use server';
                    await publishDraft(projectId, input);
                }}
                onReplay={async () => {
                    'use server';
                    await replayDraft(projectId);
                }}
                onDiscard={async () => {
                    'use server';
                    await discardDraft(projectId);
                }}
            />
        </>
    );
}
