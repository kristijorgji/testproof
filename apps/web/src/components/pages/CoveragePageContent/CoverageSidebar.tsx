'use client';

import type { Ledger, PlatformNode } from '@testproof/core';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { CoverageSummaryBar } from '@/components/coverage/CoverageSummaryBar';
import { CoverageToolbar } from '@/components/coverage/CoverageToolbar';
import type { useCoverageFilters } from '@/components/coverage/useCoverageFilters';
import { FlowNavTree } from '@/components/flow-tree/FlowNavTree/FlowNavTree';
import type { CoverageRow, CoverageSnapshotMeta } from '@/lib/coverage-types';

export function CoverageSidebar({
    projectId,
    ledger,
    coverage,
    snapshot,
    platforms,
    filters,
    selectedFlowId,
    onSelectedFlowIdChange,
}: {
    projectId: string;
    ledger: Ledger;
    coverage: Record<string, CoverageRow>;
    snapshot: CoverageSnapshotMeta | null;
    platforms: PlatformNode[];
    filters: ReturnType<typeof useCoverageFilters>;
    selectedFlowId: string | undefined;
    onSelectedFlowIdChange: (id: string | undefined) => void;
}) {
    const { t } = useTranslation();
    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="shrink-0 border-b border-[var(--border)] p-3">
                <h1 className="mb-3 text-lg font-semibold">{t('coverage.title')}</h1>
                <CoverageSummaryBar snapshot={snapshot} />
                <div className="mt-3">
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
                </div>
            </div>
            {filters.filteredAreas.length === 0 ? (
                <p className="p-3 text-sm text-[var(--muted)]">{t('coverage.noMatches')}</p>
            ) : (
                <FlowNavTree
                    ledger={ledger}
                    selectedId={selectedFlowId}
                    collapsedAreaIds={filters.collapsedAreas}
                    collapsedFlowIds={filters.collapsedFlows}
                    collapsedGroupKeys={filters.collapsedGroups}
                    statusByFlowId={(id) => coverage[id]?.status ?? 'todo'}
                    renderFlowActions={(flowId) => (
                        <Link
                            href={`/projects/${projectId}/flows?flow=${encodeURIComponent(flowId)}`}
                            className="text-xs text-[var(--accent)] underline"
                        >
                            {t('coverage.editFlow')}
                        </Link>
                    )}
                    onSelect={onSelectedFlowIdChange}
                    onToggleArea={filters.toggleArea}
                    onToggleFlow={filters.toggleFlow}
                    onToggleGroup={filters.toggleGroup}
                    onCollapsedAreaIdsChange={filters.setCollapsedAreas}
                    onCollapsedFlowIdsChange={filters.setCollapsedFlows}
                    onCollapsedGroupKeysChange={filters.setCollapsedGroups}
                />
            )}
        </div>
    );
}
