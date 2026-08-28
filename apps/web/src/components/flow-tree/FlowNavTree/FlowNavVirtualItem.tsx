'use client';

import type { CoverageStatus } from '@testproof/core';
import type { ReactNode } from 'react';

import type { NavRow } from './flow-nav-rows';
import { FlowNavDroppableHeader } from './FlowNavDroppableHeader';
import { FlowNavRow } from './FlowNavRow';
import { FlowNavSortableRow } from './FlowNavSortableRow';

export function FlowNavVirtualItem({
    row,
    selectedId,
    collapsedAreaIds,
    collapsedFlowIds,
    collapsedGroupKeys,
    enableDrag,
    statusByFlowId,
    renderFlowActions,
    onSelect,
    onToggleArea,
    onToggleFlow,
    onToggleGroup,
}: {
    row: NavRow;
    selectedId?: string;
    collapsedAreaIds: Set<string>;
    collapsedFlowIds: Set<string>;
    collapsedGroupKeys: Set<string>;
    enableDrag: boolean;
    statusByFlowId?: (id: string) => CoverageStatus;
    renderFlowActions?: (flowId: string) => ReactNode;
    onSelect?: (flowId: string) => void;
    onToggleArea: (areaId: string) => void;
    onToggleFlow: (flowId: string) => void;
    onToggleGroup: (groupKey: string) => void;
}) {
    if (row.kind === 'flow') {
        const shared = {
            row,
            selected: selectedId === row.id,
            collapsed: collapsedFlowIds.has(row.id),
            status: statusByFlowId?.(row.id),
            actions: renderFlowActions?.(row.id),
            onSelect,
            onToggle: () => onToggleFlow(row.id),
        };
        return enableDrag ? (
            <FlowNavSortableRow {...shared} enableDrag />
        ) : (
            <FlowNavRow {...shared} enableDrag={false} />
        );
    }

    const collapsed = row.kind === 'area' ? collapsedAreaIds.has(row.areaId) : collapsedGroupKeys.has(row.key);
    const onToggle = row.kind === 'area' ? () => onToggleArea(row.areaId) : () => onToggleGroup(row.key);
    return enableDrag ? (
        <FlowNavDroppableHeader row={row} collapsed={collapsed} enableDrag onToggle={onToggle} />
    ) : (
        <FlowNavRow row={row} selected={false} collapsed={collapsed} enableDrag={false} onToggle={onToggle} />
    );
}
