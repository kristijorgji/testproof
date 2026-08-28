'use client';

import type { CoverageStatus } from '@testproof/core';

import type { NavRow } from './flow-nav-rows';

import { StatusBadge } from '@/components/status/StatusBadge/StatusBadge';

export function FlowNavFlowRowContent({
    row,
    status,
    onSelect,
}: {
    row: Extract<NavRow, { kind: 'flow' }>;
    status?: CoverageStatus;
    onSelect?: (flowId: string) => void;
}) {
    const label = `${row.id} ${row.title}`;
    return (
        <button
            type="button"
            className="flex min-w-0 flex-1 items-center gap-2 py-2 text-left"
            title={label}
            onClick={() => onSelect?.(row.id)}
        >
            {status ? <StatusBadge status={status} /> : null}
            <code className="min-w-0 truncate whitespace-nowrap text-xs">{row.id}</code>
            <span className="min-w-0 truncate text-sm text-[var(--muted)]">{row.title}</span>
        </button>
    );
}
