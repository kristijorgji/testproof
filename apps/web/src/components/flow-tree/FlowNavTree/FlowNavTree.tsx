'use client';

import type { FlowNavTreeProps } from './flow-nav-tree-props';
import { FlowNavTreeBody } from './FlowNavTreeBody';
import { useFlowNavTreeModel } from './useFlowNavTreeModel';

export function FlowNavTree(props: FlowNavTreeProps) {
    const { scrollRef, rows, flowIds, virtualizer } = useFlowNavTreeModel({
        ledger: props.ledger,
        selectedId: props.selectedId,
        collapsedAreaIds: props.collapsedAreaIds,
        collapsedFlowIds: props.collapsedFlowIds,
        collapsedGroupKeys: props.collapsedGroupKeys,
        onCollapsedAreaIdsChange: props.onCollapsedAreaIdsChange,
        onCollapsedFlowIdsChange: props.onCollapsedFlowIdsChange,
    });

    return (
        <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
            <FlowNavTreeBody
                ledger={props.ledger}
                rows={rows}
                flowIds={flowIds}
                scrollRef={scrollRef}
                virtualizer={virtualizer}
                selectedId={props.selectedId}
                collapsedAreaIds={props.collapsedAreaIds}
                collapsedFlowIds={props.collapsedFlowIds}
                collapsedGroupKeys={props.collapsedGroupKeys}
                enableDrag={props.enableDrag ?? false}
                statusByFlowId={props.statusByFlowId}
                renderFlowActions={props.renderFlowActions}
                onSelect={props.onSelect}
                onToggleArea={props.onToggleArea}
                onToggleFlow={props.onToggleFlow}
                onToggleGroup={props.onToggleGroup}
                onMove={props.onMove}
                onIndent={props.onIndent}
                onOutdent={props.onOutdent}
                onRequestDelete={props.onRequestDelete}
                onFocusTitle={props.onFocusTitle}
            />
        </div>
    );
}
