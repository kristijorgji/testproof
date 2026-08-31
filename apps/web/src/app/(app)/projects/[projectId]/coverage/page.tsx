import { notFound } from 'next/navigation';

import { CoveragePageContent } from '@/components/pages/CoveragePageContent/CoveragePageContent';
import { LedgerConfigGateContent } from '@/components/pages/LedgerConfigGateContent/LedgerConfigGateContent';
import { isLedgerConfigError } from '@/lib/ledger-config-error';
import { getLatestCoverageSnapshot } from '@/server/coverage';
import { readProjectLedger } from '@/server/ledger-source';
import { getProject } from '@/server/project';
import { requireUser } from '@/server/session';
import { loadWorkingLedger } from '@/server/working-ledger';

export default async function CoveragePage({ params }: { params: Promise<{ projectId: string }> }) {
    const user = await requireUser();
    const { projectId } = await params;
    const project = await getProject(projectId);
    if (!project) notFound();

    try {
        const ledgerFile = await readProjectLedger(projectId, user.id);
        const { rows, snapshot } = await getLatestCoverageSnapshot(projectId);
        const { ledger } = loadWorkingLedger(ledgerFile.content, []);
        return (
            <CoveragePageContent
                name={project.name}
                projectId={projectId}
                ledger={ledger}
                coverage={rows}
                snapshot={snapshot}
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
