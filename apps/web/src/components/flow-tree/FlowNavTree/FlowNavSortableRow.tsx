'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { CoverageStatus } from '@testproof/core';
import type { ReactNode } from 'react';

import type { NavRow } from './flow-nav-rows';
import { FlowNavRow } from './FlowNavRow';

export function FlowNavSortableRow({
    row,
    selected,
    collapsed,
    status,
    actions,
    enableDrag,
    onSelect,
    onToggle,
}: {
    row: Extract<NavRow, { kind: 'flow' }>;
    selected: boolean;
    collapsed: boolean;
    status?: CoverageStatus;
    actions?: ReactNode;
    enableDrag: boolean;
    onSelect?: (flowId: string) => void;
    onToggle?: () => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id: row.id,
        disabled: !enableDrag,
    });

    return (
        <div ref={setNodeRef}>
            <FlowNavRow
                row={row}
                selected={selected}
                collapsed={collapsed}
                status={status}
                actions={actions}
                enableDrag={enableDrag}
                dragStyle={{
                    transform: CSS.Transform.toString(transform),
                    transition,
                }}
                dragAttributes={attributes}
                dragListeners={listeners}
                onSelect={onSelect}
                onToggle={onToggle}
            />
        </div>
    );
}
