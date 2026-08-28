'use client';

import { closestCenter, DndContext, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { CoverageStatus, Ledger, LedgerPatch } from '@testproof/core';
import type { ReactNode } from 'react';

import { FlowNavDndContext } from './flow-nav-dnd-context';
import type { NavRow } from './flow-nav-rows';
import { FlowNavRow } from './FlowNavRow';
import { useFlowNavDnd } from './useFlowNavDnd';

export function FlowNavDndTree({
    ledger,
    rows,
    flowIds,
    statusByFlowId,
    onMove,
    children,
}: {
    ledger: Ledger;
    rows: NavRow[];
    flowIds: string[];
    statusByFlowId?: (id: string) => CoverageStatus;
    onMove?: (patch: LedgerPatch) => void;
    children: ReactNode;
}) {
    const dnd = useFlowNavDnd({ ledger, rows, onMove });
    const activeRow = rows.find((row) => row.kind === 'flow' && row.id === dnd.activeId);

    return (
        <FlowNavDndContext.Provider value={{ projection: dnd.projection, isInvalidTarget: dnd.isInvalidTarget }}>
            <DndContext
                sensors={dnd.sensors}
                collisionDetection={closestCenter}
                onDragStart={(event) => dnd.onDragStart(String(event.active.id))}
                onDragMove={dnd.onDragMove}
                onDragOver={dnd.onDragOver}
                onDragEnd={dnd.onDragEnd}
                onDragCancel={dnd.onDragCancel}
            >
                <SortableContext items={flowIds} strategy={verticalListSortingStrategy}>
                    {children}
                </SortableContext>
                <DragOverlay>
                    {activeRow && activeRow.kind === 'flow' ? (
                        <FlowNavRow
                            row={activeRow}
                            selected
                            collapsed={false}
                            status={statusByFlowId?.(activeRow.id)}
                            enableDrag={false}
                        />
                    ) : null}
                </DragOverlay>
            </DndContext>
        </FlowNavDndContext.Provider>
    );
}
