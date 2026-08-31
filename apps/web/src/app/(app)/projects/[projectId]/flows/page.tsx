import type { LedgerPatch } from '@testproof/core';
import { ledgerPlatforms } from '@testproof/core';
import { notFound } from 'next/navigation';

import { appendDraftPatch, discardDraft, publishDraft, replayDraft } from '@/actions/drafts';
import { FlowsPageContent } from '@/components/pages/FlowsPageContent/FlowsPageContent';
import { LedgerConfigGateContent } from '@/components/pages/LedgerConfigGateContent/LedgerConfigGateContent';
import { isLedgerConfigError } from '@/lib/ledger-config-error';
import { getLatestCoverage } from '@/server/coverage';
import { readProjectLedger } from '@/server/ledger-source';
import { getOpenDraft, getProject } from '@/server/project';
import { requireUser } from '@/server/session';
import { loadWorkingLedger } from '@/server/working-ledger';

export default async function FlowsPage({ params }: { params: Promise<{ projectId: string }> }) {
    const user = await requireUser();
    const { projectId } = await params;
    const project = await getProject(projectId);
    if (!project) notFound();

    try {
        const ledgerFile = await readProjectLedger(projectId, user.id);
        const draft = await getOpenDraft(projectId, user.id);
        const patches = (draft?.patches as LedgerPatch[] | undefined) ?? [];
        const { afterYaml: after, ledger } = loadWorkingLedger(ledgerFile.content, patches);
        const coverage = await getLatestCoverage(projectId);

        const drifted = draft != null && draft.baseBlobSha !== ledgerFile.sha;
        const conflict =
            draft?.status === 'stale' || drifted ? { remote: ledgerFile.content, draft: after } : undefined;

        return (
            <FlowsPageContent
                name={project.name}
                projectId={projectId}
                ledger={ledger}
                platforms={ledgerPlatforms(ledger)}
                coverage={coverage}
                beforeYaml={ledgerFile.content}
                afterYaml={after}
                conflict={conflict}
                storage={project.storage === 'file' || project.storage === 'db' ? project.storage : 'git'}
                ledgerFilePath={project.ledgerFilePath}
                onPatch={appendDraftPatch.bind(null, projectId)}
                onPublish={publishDraft.bind(null, projectId)}
                onReplay={replayDraft.bind(null, projectId)}
                onDiscard={discardDraft.bind(null, projectId)}
            />
        );
    } catch (error) {
        if (isLedgerConfigError(error)) {
            return (
                <LedgerConfigGateContent
                    name={project.name}
                    projectId={projectId}
                    code={error.code}
                    path={error.path}
                    causeMessage={error.causeMessage}
                />
            );
        }
        throw error;
    }
}
