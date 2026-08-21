'use client';

import type { FlowTarget, PlatformNode } from '@testproof/core';
import { targetPlatformId } from '@testproof/core/platforms';

import { TargetPickerNode } from './TargetPickerNode';

function selectedIds(targets: FlowTarget[]): Set<string> {
    return new Set(targets.map(targetPlatformId));
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
                <TargetPickerNode key={node.id} node={node} selected={selected} depth={0} onToggle={toggle} />
            ))}
        </div>
    );
}
