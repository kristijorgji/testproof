'use client';

import type { Virtualizer } from '@tanstack/react-virtual';
import type { CoverageStatus } from '@testproof/core';
import type { KeyboardEvent, ReactNode, RefObject } from 'react';

import { useFlowNavDndState } from './flow-nav-dnd-context';
import type { NavRow } from './flow-nav-rows';
import { FlowNavDropIndicator } from './FlowNavDropIndicator';
import { FlowNavVirtualRows } from './FlowNavVirtualRows';

import { Scrollbar } from '@/components/common/Scrollbar/Scrollbar';

export function FlowNavScrollList({
    scrollRef,
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
    onKeyDown,
}: {
    scrollRef: RefObject<HTMLDivElement | null>;
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
    onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
}) {
    const dnd = useFlowNavDndState();
    return (
        <Scrollbar ref={scrollRef} className="min-h-0 flex-1 outline-none" tabIndex={0} onKeyDown={onKeyDown}>
            <div className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
                <FlowNavVirtualRows
                    rows={rows}
                    virtualizer={virtualizer}
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
                <FlowNavDropIndicator rows={rows} virtualizer={virtualizer} projection={dnd.projection} />
            </div>
        </Scrollbar>
    );
}
