'use client';

import type { CoverageStatus } from '@testproof/core';

import type { NavRow } from './flow-nav-rows';

import { StatusBadge } from '@/components/status/StatusBadge/StatusBadge';
import { formatFlowIdForDisplay } from '@/lib/format-flow-id-display';

export function FlowNavFlowRowContent({
    row,
    status,
    onSelect,
}: {
    row: Extract<NavRow, { kind: 'flow' }>;
    status?: CoverageStatus;
    onSelect?: (flowId: string) => void;
}) {
    const displayId = formatFlowIdForDisplay(row.id);
    const label = `${row.id} ${row.title}`;
    return (
        <button
            type="button"
            className="flex min-w-0 flex-1 items-center gap-2 py-2 text-left"
            title={label}
            onClick={() => onSelect?.(row.id)}
        >
            {status ? <StatusBadge status={status} /> : null}
            <span className="min-w-0 truncate text-sm">{row.title}</span>
            <code className="min-w-0 shrink truncate whitespace-nowrap text-[11px] text-[var(--muted)]">
                {displayId}
            </code>
        </button>
    );
}
