'use client';

import type { CoverageStatus, Flow } from '@testproof/core';

import { StatusBadge } from '../status/StatusBadge';

export function FlowTreeRow({
    flow,
    status = 'todo',
    depth = 0,
    selected = false,
    onSelect,
}: {
    flow: Flow;
    status?: CoverageStatus;
    depth?: number;
    selected?: boolean;
    onSelect?: (id: string) => void;
}) {
    return (
        <div>
            <button
                type="button"
                className={`flex w-full items-baseline gap-2 px-3 py-2 text-left ${selected ? 'bg-[var(--border)]' : ''}`}
                style={{ paddingLeft: 12 + depth * 16 }}
                onClick={() => onSelect?.(flow.id)}
            >
                <StatusBadge status={status} />
                <code className="text-xs">{flow.id}</code>
                <span className="truncate">{flow.title}</span>
            </button>
            {(flow.children ?? []).map((child) => (
                <FlowTreeRow
                    key={child.id}
                    flow={child}
                    status={status}
                    depth={depth + 1}
                    selected={selected && child.id === flow.id}
                    onSelect={onSelect}
                />
            ))}
        </div>
    );
}
