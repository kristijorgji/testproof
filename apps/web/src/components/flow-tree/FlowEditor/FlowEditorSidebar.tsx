'use client';

import type { Ledger } from '@testproof/core';
import { useTranslation } from 'react-i18next';

import { FlowEditorCreateForm } from './FlowEditorCreateForm';
import { FlowEditorSidebarActions } from './FlowEditorSidebarActions';
import { FlowTreeToolbar } from './FlowTreeToolbar';
import type { FlowCoverageById, FlowEditorActions } from './useFlowEditorActions';
import { useFlowEditorTreeFilters } from './useFlowEditorTreeFilters';

import { FlowNavTree } from '@/components/flow-tree/FlowNavTree/FlowNavTree';

export function FlowEditorSidebar({
    ledger,
    coverage,
    actions,
    onRequestDelete,
}: {
    ledger: Ledger;
    coverage: FlowCoverageById;
    actions: FlowEditorActions;
    onRequestDelete: (flowId: string) => void;
}) {
    const { t } = useTranslation();
    const filters = useFlowEditorTreeFilters({
        ledger,
        coverage,
        selectedId: actions.selectedId,
        onSelectedIdChange: actions.setSelectedId,
    });

    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="shrink-0">
                <FlowTreeToolbar
                    query={filters.query}
                    statusFilter={filters.statusFilter}
                    onQueryChange={filters.setQuery}
                    onStatusFilterChange={filters.setStatusFilter}
                />
            </div>
            {filters.filteredAreas.length === 0 ? (
                <p className="p-3 text-sm text-[var(--muted)]">{t('coverage.noMatches')}</p>
            ) : (
                <FlowNavTree
                    ledger={filters.treeLedger}
                    selectedId={actions.selectedId}
                    collapsedAreaIds={actions.collapsedAreas}
                    collapsedFlowIds={actions.collapsedFlows}
                    collapsedGroupKeys={actions.collapsedGroups}
                    enableDrag
                    statusByFlowId={(id) => coverage[id]?.status ?? 'todo'}
                    renderFlowActions={(flowId) => (
                        <FlowEditorSidebarActions
                            flowId={flowId}
                            onAddChild={actions.addChildFlow}
                            onRequestDelete={onRequestDelete}
                        />
                    )}
                    onSelect={actions.setSelectedId}
                    onToggleArea={actions.toggleArea}
                    onToggleFlow={actions.toggleFlow}
                    onToggleGroup={actions.toggleGroup}
                    onCollapsedAreaIdsChange={actions.setCollapsedAreas}
                    onCollapsedFlowIdsChange={actions.setCollapsedFlows}
                    onCollapsedGroupKeysChange={actions.setCollapsedGroups}
                    onMove={actions.apply}
                    onIndent={actions.indentSelected}
                    onOutdent={actions.outdentSelected}
                    onRequestDelete={() => actions.selectedId && onRequestDelete(actions.selectedId)}
                    onFocusTitle={actions.bumpFocusTitle}
                />
            )}
            <div className="shrink-0">
                <FlowEditorCreateForm ledger={ledger} actions={actions} />
            </div>
        </div>
    );
}
