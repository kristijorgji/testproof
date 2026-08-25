'use client';

import type { FlowNavTreeProps } from './flow-nav-tree-props';
import { FlowNavDndTree } from './FlowNavDndTree';
import { FlowNavScrollList } from './FlowNavScrollList';
import { useFlowNavTreeModel } from './useFlowNavTreeModel';

export function FlowNavTree({
    ledger,
    selectedId,
    collapsedAreaIds,
    collapsedFlowIds,
    enableDrag = false,
    statusByFlowId,
    renderFlowActions,
    onSelect,
    onToggleArea,
    onToggleFlow,
    onCollapsedAreaIdsChange,
    onCollapsedFlowIdsChange,
    onMove,
}: FlowNavTreeProps) {
    const { scrollRef, rows, flowIds, virtualizer } = useFlowNavTreeModel({
        ledger,
        selectedId,
        collapsedAreaIds,
        collapsedFlowIds,
        onCollapsedAreaIdsChange,
        onCollapsedFlowIdsChange,
    });
    const list = (
        <FlowNavScrollList
            scrollRef={scrollRef}
            rows={rows}
            virtualizer={virtualizer}
            selectedId={selectedId}
            collapsedAreaIds={collapsedAreaIds}
            collapsedFlowIds={collapsedFlowIds}
            enableDrag={enableDrag}
            statusByFlowId={statusByFlowId}
            renderFlowActions={renderFlowActions}
            onSelect={onSelect}
            onToggleArea={onToggleArea}
            onToggleFlow={onToggleFlow}
        />
    );

    return (
        <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
            {enableDrag ? (
                <FlowNavDndTree
                    ledger={ledger}
                    rows={rows}
                    flowIds={flowIds}
                    statusByFlowId={statusByFlowId}
                    onMove={onMove}
                >
                    {list}
                </FlowNavDndTree>
            ) : (
                list
            )}
        </div>
    );
}
