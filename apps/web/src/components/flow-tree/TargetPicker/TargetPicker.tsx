'use client';

import type { FlowTarget, PlatformNode } from '@testproof/core';
import { targetPlatformId } from '@testproof/core/platforms';

import { TargetPickerNode } from './TargetPickerNode';

function findPlatformNode(nodes: PlatformNode[], id: string): PlatformNode | undefined {
    for (const node of nodes) {
        if (node.id === id) return node;
        const child = findPlatformNode(node.children ?? [], id);
        if (child) return child;
    }
    return undefined;
}

function subtreeIds(node: PlatformNode): string[] {
    return [node.id, ...(node.children ?? []).flatMap((child) => subtreeIds(child))];
}

function isNodeChecked(node: PlatformNode, selected: Set<string>): boolean {
    const children = node.children ?? [];
    if (children.length === 0) return selected.has(node.id);
    return selected.has(node.id) || children.every((child) => isNodeChecked(child, selected));
}

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
        const node = findPlatformNode(platforms, id);
        if (!node) return;
        const next = new Set(selected);
        const checked = isNodeChecked(node, selected);
        const ids = subtreeIds(node);

        if (checked) {
            for (const subtreeId of ids) next.delete(subtreeId);
        } else if (node.children?.length) {
            for (const subtreeId of ids) next.delete(subtreeId);
            next.add(node.id);
        } else {
            next.add(node.id);
        }

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
