'use client';

import type { CoverageStatus, Flow } from '@testproof/core';

import { StatusBadge } from '../../status/StatusBadge/StatusBadge';

export function FlowTreeRow({
    flow,
    status = 'todo',
    statusByFlowId,
    depth = 0,
    selectedId,
    onSelect,
}: {
    flow: Flow;
    status?: CoverageStatus;
    statusByFlowId?: (id: string) => CoverageStatus;
    depth?: number;
    selectedId?: string;
    onSelect?: (id: string) => void;
}) {
    const resolveStatus = (id: string): CoverageStatus => statusByFlowId?.(id) ?? status;

    return (
        <div>
            <button
                type="button"
                className={`flex w-full items-baseline gap-2 px-3 py-2 text-left ${selectedId === flow.id ? 'bg-[var(--border)]' : ''}`}
                style={{ paddingLeft: 12 + depth * 16 }}
                onClick={() => onSelect?.(flow.id)}
            >
                <StatusBadge status={resolveStatus(flow.id)} />
                <code className="text-xs">{flow.id}</code>
                <span className="truncate">{flow.title}</span>
            </button>
            {(flow.children ?? []).map((child) => (
                <FlowTreeRow
                    key={child.id}
                    flow={child}
                    status={status}
                    statusByFlowId={statusByFlowId}
                    depth={depth + 1}
                    selectedId={selectedId}
                    onSelect={onSelect}
                />
            ))}
        </div>
    );
}
