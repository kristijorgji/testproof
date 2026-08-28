'use client';

import type { DraggableAttributes, DraggableSyntheticListeners } from '@dnd-kit/core';
import type { CoverageStatus } from '@testproof/core';
import type { CSSProperties, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { useFlowNavDndState } from './flow-nav-dnd-context';
import type { NavRow } from './flow-nav-rows';
import { FLOW_ROW_BASE_PAD_PX, FLOW_ROW_INDENT_PX } from './flow-nav-zone';
import { FlowNavDepthGuides } from './FlowNavDepthGuides';
import { FlowNavDragHandle } from './FlowNavDragHandle';
import { FlowNavFlowRowContent } from './FlowNavFlowRowContent';

export function FlowNavFlowRow({
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
    row: Extract<NavRow, { kind: 'flow' }>;
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
    const { t } = useTranslation();
    const dnd = useFlowNavDndState();
    const invalid = dnd.isInvalidTarget(row.id);
    const childTarget =
        dnd.projection?.overKey === row.key && dnd.projection.zone === 'child' && !dnd.projection.invalid;

    return (
        <div
            data-flow-id={row.id}
            className={`group relative flex w-full items-center gap-1 ${selected ? 'bg-[var(--border)]' : ''} ${
                childTarget ? 'bg-[var(--accent)]/15 ring-1 ring-[var(--accent)]' : ''
            } ${invalid ? 'opacity-40' : ''}`}
            style={{ ...dragStyle, paddingLeft: FLOW_ROW_BASE_PAD_PX + row.depth * FLOW_ROW_INDENT_PX }}
        >
            <FlowNavDepthGuides depth={row.depth} />
            {enableDrag ? <FlowNavDragHandle attributes={dragAttributes} listeners={dragListeners} /> : null}
            {row.hasChildren ? (
                <button
                    type="button"
                    className="flex h-6 w-6 shrink-0 items-center justify-center text-xs text-[var(--muted)]"
                    aria-label={collapsed ? t('editor.expand') : t('editor.collapse')}
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggle?.();
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    {collapsed ? '▸' : '▾'}
                </button>
            ) : (
                <span className="w-6 shrink-0" />
            )}
            <FlowNavFlowRowContent row={row} status={status} onSelect={onSelect} />
            {actions ? (
                <div
                    className={`flex shrink-0 items-center gap-1 pr-2 ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                >
                    {actions}
                </div>
            ) : null}
        </div>
    );
}
