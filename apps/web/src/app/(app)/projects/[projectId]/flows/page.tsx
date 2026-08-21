import type { LedgerPatch } from '@testproof/core';
import {
    applyPatches,
    ledgerPlatforms,
    openLedgerDocument,
    parseLedger,
    serializeLedgerDocument,
} from '@testproof/core';
import { notFound } from 'next/navigation';

import { appendDraftPatch, discardDraft, publishDraft, replayDraft } from '@/actions/drafts';
import { FlowEditor } from '@/components/flow-tree/FlowEditor';
import { ProjectNav } from '@/components/layout/ProjectNav';
import { getLatestCoverage } from '@/server/coverage';
import { readProjectLedger } from '@/server/ledger-source';
import { getOpenDraft, getProject } from '@/server/project';
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
    const coverage = await getLatestCoverage(projectId);

    const conflict = draft?.status === 'stale' ? { remote: ledgerFile.content, draft: after } : undefined;

    return (
        <>
            <ProjectNav name={project.name} projectId={projectId} />
            <FlowEditor
                ledger={ledger}
                platforms={ledgerPlatforms(ledger)}
                coverage={coverage}
                beforeYaml={ledgerFile.content}
                afterYaml={after}
                conflict={conflict}
                onPatch={appendDraftPatch.bind(null, projectId)}
                onPublish={publishDraft.bind(null, projectId)}
                onReplay={replayDraft.bind(null, projectId)}
                onDiscard={discardDraft.bind(null, projectId)}
            />
        </>
    );
}
