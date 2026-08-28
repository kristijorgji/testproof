'use client';

import type { NavRow } from './flow-nav-rows';

export function FlowNavSectionHeader({
    row,
    collapsed,
    onToggle,
}: {
    row: Extract<NavRow, { kind: 'area' | 'cluster' | 'group' }>;
    collapsed: boolean;
    onToggle?: () => void;
}) {
    if (row.kind === 'area') {
        return (
            <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs uppercase text-[var(--muted)]"
                aria-expanded={!collapsed}
                onClick={onToggle}
            >
                <span className="flex h-6 w-6 items-center justify-center">{collapsed ? '▸' : '▾'}</span>
                <span className="truncate">{row.title}</span>
            </button>
        );
    }

    const paddingLeft = row.kind === 'group' && row.nestedUnderCluster ? 36 : 20;
    const weight = row.kind === 'cluster' ? 'font-medium' : '';
    return (
        <button
            type="button"
            className={`flex w-full items-center gap-2 py-1 text-left text-xs text-[var(--muted)] ${weight}`}
            style={{ paddingLeft }}
            aria-expanded={!collapsed}
            onClick={onToggle}
        >
            <span className="flex h-6 w-6 items-center justify-center">{collapsed ? '▸' : '▾'}</span>
            <span className="truncate">{row.title}</span>
        </button>
    );
}
