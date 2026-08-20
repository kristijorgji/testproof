'use client';

import type { FlowTarget, PlatformNode } from '@testproof/core';
import { targetPlatformId } from '@testproof/core';

function selectedIds(targets: FlowTarget[]): Set<string> {
    return new Set(targets.map(targetPlatformId));
}

function NodeRow({
    node,
    selected,
    onToggle,
    depth,
}: {
    node: PlatformNode;
    selected: Set<string>;
    onToggle: (id: string) => void;
    depth: number;
}) {
    const childIds = (node.children ?? []).map((c) => c.id);
    const childSelected = childIds.filter((id) => selected.has(id)).length;
    const self = selected.has(node.id);
    const allChildren = childIds.length > 0 && childSelected === childIds.length;
    const checked = self || allChildren;
    const indeterminate = !checked && childSelected > 0;

    return (
        <div>
            <label className="flex items-center gap-2 py-1" style={{ paddingLeft: depth * 16 }}>
                <input
                    type="checkbox"
                    checked={checked}
                    ref={(el) => {
                        if (el) el.indeterminate = indeterminate;
                    }}
                    onChange={() => onToggle(node.id)}
                />
                <span>{node.title}</span>
                <code className="text-xs text-[var(--muted)]">{node.id}</code>
            </label>
            {(node.children ?? []).map((child) => (
                <NodeRow key={child.id} node={child} selected={selected} onToggle={onToggle} depth={depth + 1} />
            ))}
        </div>
    );
}

export function TargetPicker({
    platforms,
    targets,
    onChange,
}: {
    platforms: PlatformNode[];
    targets: FlowTarget[];
    onChange: (next: FlowTarget[]) => void;
}) {
    const selected = selectedIds(targets);

    const toggle = (id: string): void => {
        const next = new Set(selected);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        onChange([...next].map((platform) => ({ platform })));
    };

    return (
        <div className="rounded-md border border-[var(--border)] p-3">
            {platforms.map((node) => (
                <NodeRow key={node.id} node={node} selected={selected} onToggle={toggle} depth={0} />
            ))}
        </div>
    );
}
