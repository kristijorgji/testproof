'use client';

import type { Ledger } from '@testproof/core';
import { ledgerPlatforms } from '@testproof/core/platforms';
import { useTranslation } from 'react-i18next';

import { CoverageFlowPanel } from '@/components/coverage/CoverageFlowPanel';
import { CoverageSummaryBar } from '@/components/coverage/CoverageSummaryBar';
import { CoverageToolbar } from '@/components/coverage/CoverageToolbar';
import { CoverageTree } from '@/components/coverage/CoverageTree';
import { useCoverageFilters } from '@/components/coverage/useCoverageFilters';
import { ProjectNav } from '@/components/layout/ProjectNav/ProjectNav';
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
    const filters = useCoverageFilters({ ledger, coverage });
    const platforms = ledgerPlatforms(ledger);
    const hasFlows = ledger.areas.some((area) => area.groups.some((group) => group.flows.length > 0));

    return (
        <>
            <ProjectNav name={name} projectId={projectId} />
            <main className="mx-auto max-w-6xl p-6">
                <h1 className="mb-4 text-2xl font-semibold">{t('coverage.title')}</h1>
                {!hasFlows ? (
                    <p className="text-[var(--muted)]">{t('coverage.empty')}</p>
                ) : (
                    <div className="grid gap-4">
                        <CoverageSummaryBar snapshot={snapshot} />
                        <CoverageToolbar
                            query={filters.query}
                            statusFilter={filters.statusFilter}
                            platforms={platforms}
                            platformFilter={filters.platformFilter}
                            onQueryChange={filters.setQuery}
                            onStatusFilterChange={filters.setStatusFilter}
                            onTogglePlatform={filters.togglePlatform}
                            onClearPlatforms={filters.clearPlatforms}
                        />
                        <div className="grid gap-4 lg:grid-cols-2">
                            <CoverageTree
                                projectId={projectId}
                                areas={filters.filteredAreas}
                                coverage={coverage}
                                selectedFlowId={filters.selectedFlowId}
                                collapsedAreas={filters.collapsedAreas}
                                onSelectFlow={filters.setSelectedFlowId}
                                onToggleArea={filters.toggleArea}
                            />
                            <CoverageFlowPanel
                                ledger={ledger}
                                coverage={coverage}
                                selectedFlowId={filters.selectedFlowId}
                            />
                        </div>
                    </div>
                )}
            </main>
        </>
    );
}
