'use client';

import type { PlatformNode } from '@testproof/core';

export function TargetPickerNode({
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
                    ref={(el) => {
                        if (el) el.indeterminate = indeterminate;
                    }}
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(node.id)}
                />
                <span>{node.title}</span>
                <code className="text-xs text-[var(--muted)]">{node.id}</code>
            </label>
            {(node.children ?? []).map((child) => (
                <TargetPickerNode
                    key={child.id}
                    node={child}
                    selected={selected}
                    depth={depth + 1}
                    onToggle={onToggle}
                />
            ))}
        </div>
    );
}
