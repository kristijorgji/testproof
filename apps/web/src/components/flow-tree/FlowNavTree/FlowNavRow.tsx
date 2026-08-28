'use client';

import type { DraggableAttributes, DraggableSyntheticListeners } from '@dnd-kit/core';
import type { CoverageStatus } from '@testproof/core';
import type { CSSProperties, ReactNode } from 'react';

import type { NavRow } from './flow-nav-rows';
import { FlowNavFlowRow } from './FlowNavFlowRow';
import { FlowNavSectionHeader } from './FlowNavSectionHeader';

export function FlowNavRow({
    row,
    selected,
    collapsed,
    status,
    actions,
    enableDrag,
    dragStyle,
    dragAttributes,
    dragListeners,
    onSelect,
    onToggle,
}: {
    row: NavRow;
    selected: boolean;
    collapsed: boolean;
    status?: CoverageStatus;
    actions?: ReactNode;
    enableDrag: boolean;
    dragStyle?: CSSProperties;
    dragAttributes?: DraggableAttributes;
    dragListeners?: DraggableSyntheticListeners;
    onSelect?: (flowId: string) => void;
    onToggle?: () => void;
}) {
    if (row.kind !== 'flow') {
        return <FlowNavSectionHeader row={row} collapsed={collapsed} onToggle={onToggle} />;
    }

    return (
        <FlowNavFlowRow
            row={row}
            selected={selected}
            collapsed={collapsed}
            status={status}
            actions={actions}
            enableDrag={enableDrag}
            dragStyle={dragStyle}
            dragAttributes={dragAttributes}
            dragListeners={dragListeners}
            onSelect={onSelect}
            onToggle={onToggle}
        />
    );
}
