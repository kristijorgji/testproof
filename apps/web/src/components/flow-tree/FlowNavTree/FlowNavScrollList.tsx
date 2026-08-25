'use client';

import type { Virtualizer } from '@tanstack/react-virtual';
import type { CoverageStatus } from '@testproof/core';
import type { ReactNode, RefObject } from 'react';

import type { NavRow } from './flow-nav-rows';
import { FlowNavVirtualItem } from './FlowNavVirtualItem';

export function FlowNavScrollList({
    scrollRef,
    rows,
    virtualizer,
    selectedId,
    collapsedAreaIds,
    collapsedFlowIds,
    enableDrag,
    statusByFlowId,
    renderFlowActions,
    onSelect,
    onToggleArea,
    onToggleFlow,
}: {
    scrollRef: RefObject<HTMLDivElement | null>;
    rows: NavRow[];
    virtualizer: Virtualizer<HTMLDivElement, Element>;
    selectedId?: string;
    collapsedAreaIds: Set<string>;
    collapsedFlowIds: Set<string>;
    enableDrag: boolean;
    statusByFlowId?: (id: string) => CoverageStatus;
    renderFlowActions?: (flowId: string) => ReactNode;
    onSelect?: (flowId: string) => void;
    onToggleArea: (areaId: string) => void;
    onToggleFlow: (flowId: string) => void;
}) {
    return (
        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
            <div className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
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
                                enableDrag={enableDrag}
                                statusByFlowId={statusByFlowId}
                                renderFlowActions={renderFlowActions}
                                onSelect={onSelect}
                                onToggleArea={onToggleArea}
                                onToggleFlow={onToggleFlow}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
