'use client';

import type { Virtualizer } from '@tanstack/react-virtual';
import type { CoverageStatus } from '@testproof/core';
import type { ReactNode } from 'react';

import type { NavRow } from './flow-nav-rows';
import { FlowNavVirtualItem } from './FlowNavVirtualItem';

export function FlowNavVirtualRows({
    rows,
    virtualizer,
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
    rows: NavRow[];
    virtualizer: Virtualizer<HTMLDivElement, Element>;
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
    return (
        <>
            {virtualizer.getVirtualItems().map((virtualRow) => {
                const row = rows[virtualRow.index];
                if (!row) return null;
                return (
                    <div
                        key={row.key}
                        className="absolute top-0 left-0 w-full"
                        style={{ transform: `translateY(${virtualRow.start}px)` }}
                    >
                        <FlowNavVirtualItem
                            row={row}
                            selectedId={selectedId}
                            collapsedAreaIds={collapsedAreaIds}
                            collapsedFlowIds={collapsedFlowIds}
                            collapsedGroupKeys={collapsedGroupKeys}
                            enableDrag={enableDrag}
                            statusByFlowId={statusByFlowId}
                            renderFlowActions={renderFlowActions}
                            onSelect={onSelect}
                            onToggleArea={onToggleArea}
                            onToggleFlow={onToggleFlow}
                            onToggleGroup={onToggleGroup}
                        />
                    </div>
                );
            })}
        </>
    );
}
