import { parseLedger } from '@testproof/core';
import { flattenFlows } from '@testproof/core/parse';
import { notFound } from 'next/navigation';

import { ProjectNav } from '@/components/layout/ProjectNav';
import { StatusBadge } from '@/components/status/StatusBadge';
import { getLocaleFromCookie } from '@/i18n/get-locale';
import { getServerTranslation } from '@/i18n/server';
import { getLatestCoverage } from '@/server/coverage';
import { readProjectLedger } from '@/server/ledger-source';
import { getProject } from '@/server/project';
import { requireUser } from '@/server/session';

export default async function CoveragePage({ params }: { params: Promise<{ projectId: string }> }) {
    const user = await requireUser();
    const { t } = await getServerTranslation(await getLocaleFromCookie());
    const { projectId } = await params;
    const project = await getProject(projectId);
    if (!project) notFound();
    const ledgerFile = await readProjectLedger(projectId, user.id);
    const ledger = parseLedger(ledgerFile.content);
    const coverage = await getLatestCoverage(projectId);
    const flows = flattenFlows(ledger);

    return (
        <>
            <ProjectNav name={project.name} projectId={projectId} />
            <main className="mx-auto max-w-3xl p-6">
                <h1 className="mb-4 text-2xl font-semibold">{t('coverage.title')}</h1>
                {flows.length === 0 ? (
                    <p>{t('coverage.empty')}</p>
                ) : (
                    <ul className="grid gap-2">
                        {flows.map((flow) => {
                            const row = coverage[flow.id];
                            return (
                                <li
                                    key={flow.id}
                                    className="flex items-baseline gap-2 rounded border border-[var(--border)] p-3"
                                >
                                    <StatusBadge status={row?.status ?? 'todo'} />
                                    <code className="text-xs">{flow.id}</code>
                                    <span className="flex-1 truncate">{flow.title}</span>
                                    <span className="text-xs text-[var(--muted)]">
                                        {t('coverage.demandedCovered', {
                                            demanded: row?.demanded.length ?? 0,
                                            covered: row?.covered.length ?? 0,
                                        })}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </main>
        </>
    );
}
