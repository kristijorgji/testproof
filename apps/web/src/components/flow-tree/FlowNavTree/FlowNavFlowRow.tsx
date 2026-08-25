'use client';

import type { DraggableAttributes, DraggableSyntheticListeners } from '@dnd-kit/core';
import type { CoverageStatus } from '@testproof/core';
import type { CSSProperties, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import type { NavRow } from './flow-nav-rows';

import { StatusBadge } from '@/components/status/StatusBadge/StatusBadge';

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
    const label = `${row.id} ${row.title}`;

    return (
        <div
            data-flow-id={row.id}
            className={`group flex w-full items-center gap-1 ${selected ? 'bg-[var(--border)]' : ''}`}
            style={{ ...dragStyle, paddingLeft: 8 + row.depth * 16 }}
        >
            {row.depth > 0 ? <span className="h-6 w-px shrink-0 bg-[var(--border)]" aria-hidden /> : null}
            {row.hasChildren ? (
                <button
                    type="button"
                    className="shrink-0 px-1 text-xs text-[var(--muted)]"
                    aria-label={collapsed ? t('editor.expand') : t('editor.collapse')}
                    onClick={onToggle}
                >
                    {collapsed ? '▸' : '▾'}
                </button>
            ) : (
                <span className="w-4 shrink-0" />
            )}
            <button
                type="button"
                className="flex min-w-0 flex-1 items-center gap-2 py-2 text-left"
                title={label}
                {...(enableDrag ? dragAttributes : {})}
                {...(enableDrag ? dragListeners : {})}
                onClick={() => onSelect?.(row.id)}
            >
                {status ? <StatusBadge status={status} /> : null}
                <code className="min-w-0 truncate whitespace-nowrap text-xs">{row.id}</code>
                <span className="min-w-0 truncate text-sm text-[var(--muted)]">{row.title}</span>
            </button>
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
