'use client';

import { useTranslation } from 'react-i18next';

import type { CoverageStatusFilter } from '@/components/coverage/coverage-filters';

const statusFilters: CoverageStatusFilter[] = ['all', 'automated', 'partial', 'todo', 'manual'];

function statusFilterKey(filter: CoverageStatusFilter): string {
    if (filter === 'all') return 'coverage.filterAll';
    return `coverage.filter${filter[0]?.toUpperCase() ?? ''}${filter.slice(1)}`;
}

export function FlowTreeToolbar({
    query,
    onQueryChange,
    statusFilter,
    onStatusFilterChange,
}: {
    query: string;
    onQueryChange: (value: string) => void;
    statusFilter: CoverageStatusFilter;
    onStatusFilterChange: (value: CoverageStatusFilter) => void;
}) {
    const { t } = useTranslation();

    return (
        <div className="grid gap-2 border-b border-[var(--border)] p-3">
            <input
                type="search"
                value={query}
                placeholder={t('coverage.searchPlaceholder')}
                className="rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm"
                onChange={(event) => onQueryChange(event.target.value)}
            />
            <p className="text-xs text-[var(--muted)]">{t('coverage.filterCoverageStatus')}</p>
            <div className="flex flex-wrap gap-2">
                {statusFilters.map((filter) => (
                    <button
                        key={filter}
                        type="button"
                        className={`rounded border px-2 py-1 text-xs ${
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
        </div>
    );
}
