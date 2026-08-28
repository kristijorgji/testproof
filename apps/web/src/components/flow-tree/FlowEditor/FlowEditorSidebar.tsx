'use client';

import type { Ledger } from '@testproof/core';

import { FlowEditorCreateForm } from './FlowEditorCreateForm';
import { FlowEditorSidebarActions } from './FlowEditorSidebarActions';
import type { FlowCoverageById, FlowEditorActions } from './useFlowEditorActions';

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
    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <FlowNavTree
                ledger={ledger}
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
                onMove={actions.apply}
                onIndent={actions.indentSelected}
                onOutdent={actions.outdentSelected}
                onRequestDelete={() => actions.selectedId && onRequestDelete(actions.selectedId)}
                onFocusTitle={actions.bumpFocusTitle}
            />
            <div className="shrink-0">
                <FlowEditorCreateForm ledger={ledger} actions={actions} />
            </div>
        </div>
    );
}
