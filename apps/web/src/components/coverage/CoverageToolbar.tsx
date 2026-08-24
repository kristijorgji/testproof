'use client';

import type { PlatformNode } from '@testproof/core';
import { useTranslation } from 'react-i18next';

import { TargetPickerNode } from '@/components/flow-tree/TargetPicker/TargetPickerNode';

import type { CoverageStatusFilter } from './coverage-filters';

const statusFilters: CoverageStatusFilter[] = ['all', 'automated', 'partial', 'todo', 'manual'];

function statusFilterKey(filter: CoverageStatusFilter): string {
    if (filter === 'all') return 'coverage.filterAll';
    return `coverage.filter${filter[0]?.toUpperCase() ?? ''}${filter.slice(1)}`;
}

export function CoverageToolbar({
    query,
    onQueryChange,
    statusFilter,
    onStatusFilterChange,
    platforms,
    platformFilter,
    onTogglePlatform,
    onClearPlatforms,
}: {
    query: string;
    onQueryChange: (value: string) => void;
    statusFilter: CoverageStatusFilter;
    onStatusFilterChange: (value: CoverageStatusFilter) => void;
    platforms: PlatformNode[];
    platformFilter: Set<string>;
    onTogglePlatform: (platformId: string) => void;
    onClearPlatforms: () => void;
}) {
    const { t } = useTranslation();

    return (
        <div className="grid gap-3">
            <input
                type="search"
                value={query}
                placeholder={t('coverage.searchPlaceholder')}
                className="rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
                onChange={(event) => onQueryChange(event.target.value)}
            />
            <div className="flex flex-wrap gap-2">
                {statusFilters.map((filter) => (
                    <button
                        key={filter}
                        type="button"
                        className={`rounded border px-2 py-1 text-sm ${
                            statusFilter === filter
                                ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                                : 'border-[var(--border)]'
                        }`}
                        onClick={() => onStatusFilterChange(filter)}
                    >
                        {t(statusFilterKey(filter))}
                    </button>
                ))}
            </div>
            <div className="rounded border border-[var(--border)] p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-sm text-[var(--muted)]">{t('coverage.filterPlatforms')}</span>
                    {platformFilter.size > 0 ? (
                        <button type="button" className="text-sm underline" onClick={onClearPlatforms}>
                            {t('coverage.filterAll')}
                        </button>
                    ) : null}
                </div>
                {platforms.map((node) => (
                    <TargetPickerNode
                        key={node.id}
                        node={node}
                        selected={platformFilter}
                        depth={0}
                        onToggle={onTogglePlatform}
                    />
                ))}
            </div>
        </div>
    );
}
