'use client';

import type { DraggableAttributes, DraggableSyntheticListeners } from '@dnd-kit/core';
import type { CoverageStatus } from '@testproof/core';
import type { CSSProperties, ReactNode } from 'react';

import type { NavRow } from './flow-nav-rows';
import { FlowNavFlowRow } from './FlowNavFlowRow';

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
    if (row.kind === 'area') {
        return (
            <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs uppercase text-[var(--muted)]"
                aria-expanded={!collapsed}
                onClick={onToggle}
            >
                <span className="flex h-6 w-6 items-center justify-center">{collapsed ? '▸' : '▾'}</span>
                <span className="truncate">{row.title}</span>
            </button>
        );
    }

    if (row.kind === 'group') {
        return (
            <button
                type="button"
                className="flex w-full items-center gap-2 py-1 text-left text-xs text-[var(--muted)]"
                style={{ paddingLeft: 20 }}
                aria-expanded={!collapsed}
                onClick={onToggle}
            >
                <span className="flex h-6 w-6 items-center justify-center">{collapsed ? '▸' : '▾'}</span>
                <span className="truncate">{row.title}</span>
            </button>
        );
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
