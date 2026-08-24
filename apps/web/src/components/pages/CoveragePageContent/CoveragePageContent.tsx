'use client';

import { useTranslation } from 'react-i18next';

import { ProjectNav } from '@/components/layout/ProjectNav/ProjectNav';
import { StatusBadge } from '@/components/status/StatusBadge/StatusBadge';
import type { CoverageRow } from '@/server/coverage';

export type CoverageFlowItem = { id: string; title: string };

export function CoveragePageContent({
    projectId,
    name,
    coverage,
    flows,
}: {
    projectId: string;
    name: string;
    coverage: Record<string, CoverageRow>;
    flows: CoverageFlowItem[];
}) {
    const { t } = useTranslation();
    const hasSnapshot = Object.keys(coverage).length > 0;
    return (
        <>
            <ProjectNav name={name} projectId={projectId} />
            <main className="mx-auto max-w-3xl p-6">
                <h1 className="mb-4 text-2xl font-semibold">{t('coverage.title')}</h1>
                {flows.length === 0 ? (
                    <p className="text-[var(--muted)]">{t('coverage.empty')}</p>
                ) : (
                    <>
                        {!hasSnapshot ? <p className="mb-4 text-[var(--muted)]">{t('coverage.noSnapshot')}</p> : null}
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
                    </>
                )}
            </main>
        </>
    );
}
