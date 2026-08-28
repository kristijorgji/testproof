import {
    type DragEndEvent,
    type DragMoveEvent,
    type DragOverEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import type { Ledger, LedgerPatch } from '@testproof/core';
import { useRef, useState } from 'react';

import { buildDropMovePatch, type DropZone } from './flow-nav-drop';
import type { DropProjection } from './flow-nav-projection';
import { isDescendantFlow, type NavRow } from './flow-nav-rows';
import { dropZoneFromPointer } from './flow-nav-zone';

function resolveDropProjection(
    ledger: Ledger,
    rows: NavRow[],
    overId: string | number | null | undefined,
    dragId: string | null,
    pointer: { x: number; y: number },
): DropProjection | null {
    if (!overId || !dragId) return null;
    const overRow = rows.find((row) => row.key === String(overId) || (row.kind === 'flow' && row.id === overId));
    if (!overRow) return null;

    if (overRow.kind !== 'flow') {
        return { overKey: overRow.key, zone: 'after', depth: 0, invalid: false };
    }

    let zone: DropZone = 'after';
    const el = document.querySelector(`[data-flow-id="${overRow.id}"]`);
    const rect = el?.getBoundingClientRect();
    if (rect) {
        zone = dropZoneFromPointer(rect, pointer.x, pointer.y, { depth: overRow.depth });
    }
    const depth = zone === 'child' ? overRow.depth + 1 : overRow.depth;
    const invalid = overRow.id === dragId || isDescendantFlow(ledger, dragId, overRow.id);
    return { overKey: overRow.key, zone, depth, invalid };
}

export function useFlowNavDnd({
    ledger,
    rows,
    onMove,
}: {
    ledger: Ledger;
    rows: NavRow[];
    onMove?: (patch: LedgerPatch) => void;
}): {
    activeId: string | null;
    projection: DropProjection | null;
    sensors: ReturnType<typeof useSensors>;
    onDragStart: (id: string) => void;
    onDragMove: (event: DragMoveEvent) => void;
    onDragOver: (event: DragOverEvent) => void;
    onDragEnd: (event: DragEndEvent) => void;
    onDragCancel: () => void;
    isInvalidTarget: (flowId: string) => boolean;
} {
    const pointerRef = useRef({ x: 0, y: 0 });
    const [activeId, setActiveId] = useState<string | null>(null);
    const [projection, setProjection] = useState<DropProjection | null>(null);
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

    return {
        activeId,
        projection,
        sensors,
        isInvalidTarget: (flowId: string) => {
            if (!activeId) return false;
            return flowId === activeId || isDescendantFlow(ledger, activeId, flowId);
        },
        onDragStart: (id: string) => {
            setActiveId(id);
            setProjection(null);
        },
        onDragMove: (event: DragMoveEvent) => {
            const activator = event.activatorEvent;
            if (activator instanceof PointerEvent) {
                pointerRef.current = { x: activator.clientX + event.delta.x, y: activator.clientY + event.delta.y };
            }
            setProjection(
                resolveDropProjection(
                    ledger,
                    rows,
                    event.over?.id,
                    activeId ?? String(event.active.id),
                    pointerRef.current,
                ),
            );
        },
        onDragOver: (event: DragOverEvent) => {
            setProjection(
                resolveDropProjection(
                    ledger,
                    rows,
                    event.over?.id,
                    activeId ?? String(event.active.id),
                    pointerRef.current,
                ),
            );
        },
        onDragEnd: (event: DragEndEvent) => {
            const dragId = String(event.active.id);
            const projected = resolveDropProjection(ledger, rows, event.over?.id, dragId, pointerRef.current);
            setActiveId(null);
            setProjection(null);
            const over = event.over;
            if (!over || !onMove || !projected || projected.invalid) return;
            const overRow = rows.find(
                (row) => row.key === String(over.id) || (row.kind === 'flow' && row.id === over.id),
            );
            if (!overRow) return;
            const patch = buildDropMovePatch({
                ledger,
                dragFlowId: dragId,
                overKey: overRow.key,
                overKind: overRow.kind,
                zone: projected.zone,
            });
            if (patch) onMove(patch);
        },
        onDragCancel: () => {
            setActiveId(null);
            setProjection(null);
        },
    };
}
