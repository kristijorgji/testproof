'use client';

import { useDroppable } from '@dnd-kit/core';

import type { NavRow } from './flow-nav-rows';
import { FlowNavRow } from './FlowNavRow';

export function FlowNavDroppableHeader({
    row,
    collapsed,
    enableDrag,
    onToggle,
}: {
    row: Extract<NavRow, { kind: 'area' | 'group' }>;
    collapsed: boolean;
    enableDrag: boolean;
    onToggle?: () => void;
}) {
    const { setNodeRef } = useDroppable({ id: row.key, disabled: !enableDrag });

    return (
        <div ref={setNodeRef}>
            <FlowNavRow row={row} selected={false} collapsed={collapsed} enableDrag={false} onToggle={onToggle} />
        </div>
    );
}
