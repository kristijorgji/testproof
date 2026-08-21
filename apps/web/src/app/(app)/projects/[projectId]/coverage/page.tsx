import { parseLedger } from '@testproof/core';
import { flattenFlows } from '@testproof/core/parse';
import { notFound } from 'next/navigation';

import { CoveragePageContent } from '@/components/pages/CoveragePageContent/CoveragePageContent';
import { getLatestCoverage } from '@/server/coverage';
import { readProjectLedger } from '@/server/ledger-source';
import { getProject } from '@/server/project';
import { requireUser } from '@/server/session';

export default async function CoveragePage({ params }: { params: Promise<{ projectId: string }> }) {
    const user = await requireUser();
    const { projectId } = await params;
    const project = await getProject(projectId);
    if (!project) notFound();
    const ledgerFile = await readProjectLedger(projectId, user.id);
    const coverage = await getLatestCoverage(projectId);
    const flows = flattenFlows(parseLedger(ledgerFile.content));
    return (
        <CoveragePageContent
            name={project.name}
            projectId={projectId}
            coverage={coverage}
            flows={flows.map((flow) => ({ id: flow.id, title: flow.title }))}
        />
    );
}
