'use client';

import type { Ledger } from '@testproof/core';
import { ledgerPlatforms } from '@testproof/core/platforms';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { CoverageSidebar } from './CoverageSidebar';

import { CoverageFlowPanel } from '@/components/coverage/CoverageFlowPanel';
import { useCoverageFilters } from '@/components/coverage/useCoverageFilters';
import { useCoverageFlowParam } from '@/components/coverage/useCoverageFlowParam';
import { ProjectNav } from '@/components/layout/ProjectNav/ProjectNav';
import { ProjectSplitLayout } from '@/components/layout/ProjectSplitLayout/ProjectSplitLayout';
import type { CoverageRow, CoverageSnapshotMeta } from '@/lib/coverage-types';

export function CoveragePageContent({
    projectId,
    name,
    ledger,
    coverage,
    snapshot,
}: {
    projectId: string;
    name: string;
    ledger: Ledger;
    coverage: Record<string, CoverageRow>;
    snapshot: CoverageSnapshotMeta | null;
}) {
    const { t } = useTranslation();
    const { selectedFlowId, onSelectedFlowIdChange } = useCoverageFlowParam();
    const filters = useCoverageFilters({ ledger, coverage, selectedFlowId, onSelectedFlowIdChange });
    const platforms = ledgerPlatforms(ledger);
    const hasFlows = ledger.areas.some((area) => area.groups.some((group) => group.flows.length > 0));
    const treeLedger = useMemo(() => ({ ...ledger, areas: filters.filteredAreas }), [filters.filteredAreas, ledger]);

    return (
        <>
            <ProjectNav name={name} projectId={projectId} />
            {!hasFlows ? (
                <main className="p-6">
                    <h1 className="mb-4 text-2xl font-semibold">{t('coverage.title')}</h1>
                    <p className="text-[var(--muted)]">{t('coverage.empty')}</p>
                </main>
            ) : (
                <ProjectSplitLayout
                    sidebar={
                        <CoverageSidebar
                            projectId={projectId}
                            ledger={treeLedger}
                            coverage={coverage}
                            snapshot={snapshot}
                            platforms={platforms}
                            filters={filters}
                            selectedFlowId={selectedFlowId}
                            onSelectedFlowIdChange={onSelectedFlowIdChange}
                        />
                    }
                    detail={<CoverageFlowPanel ledger={ledger} coverage={coverage} selectedFlowId={selectedFlowId} />}
                />
            )}
        </>
    );
}
