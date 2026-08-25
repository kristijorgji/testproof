import { type DragEndEvent, type DragMoveEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { Ledger, LedgerPatch } from '@testproof/core';
import { useRef, useState } from 'react';

import { buildDropMovePatch, type DropZone } from './flow-nav-drop';
import type { NavRow } from './flow-nav-rows';
import { dropZoneFromPointer } from './flow-nav-zone';

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
    sensors: ReturnType<typeof useSensors>;
    onDragStart: (id: string) => void;
    onDragMove: (event: DragMoveEvent) => void;
    onDragEnd: (event: DragEndEvent) => void;
    onDragCancel: () => void;
} {
    const pointerRef = useRef({ x: 0, y: 0 });
    const [activeId, setActiveId] = useState<string | null>(null);
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

    return {
        activeId,
        sensors,
        onDragStart: (id: string) => setActiveId(id),
        onDragMove: (event: DragMoveEvent) => {
            const activator = event.activatorEvent;
            if (activator instanceof PointerEvent) {
                pointerRef.current = { x: activator.clientX + event.delta.x, y: activator.clientY + event.delta.y };
            }
        },
        onDragEnd: (event: DragEndEvent) => {
            setActiveId(null);
            const over = event.over;
            if (!over || !onMove) return;
            const overRow = rows.find(
                (row) => row.key === String(over.id) || (row.kind === 'flow' && row.id === over.id),
            );
            if (!overRow) return;
            const zone: DropZone =
                overRow.kind === 'flow'
                    ? dropZoneFromPointer(over.rect, pointerRef.current.x, pointerRef.current.y)
                    : 'after';
            const patch = buildDropMovePatch({
                ledger,
                dragFlowId: String(event.active.id),
                overKey: overRow.key,
                overKind: overRow.kind,
                zone,
            });
            if (patch) onMove(patch);
        },
        onDragCancel: () => setActiveId(null),
    };
}
