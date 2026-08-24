'use client';

import type { CoverageStatus } from '@testproof/core';
import { useTranslation } from 'react-i18next';

import { StatusBadge } from '@/components/status/StatusBadge/StatusBadge';
import type { CoverageSnapshotMeta } from '@/lib/coverage-types';

const statuses: CoverageStatus[] = ['automated', 'partial', 'todo', 'manual'];

export function CoverageSummaryBar({ snapshot }: { snapshot: CoverageSnapshotMeta | null }) {
    const { t, i18n } = useTranslation();

    if (!snapshot) {
        return <p className="text-sm text-[var(--muted)]">{t('coverage.noSnapshot')}</p>;
    }

    return (
        <div className="grid gap-2 rounded border border-[var(--border)] p-3 text-sm">
            <p className="text-[var(--muted)]">
                {t('coverage.snapshotMeta', {
                    branch: snapshot.branch,
                    commit: snapshot.commitSha.slice(0, 7),
                    date: new Date(snapshot.createdAt).toLocaleString(i18n.language),
                })}
            </p>
            <div className="flex flex-wrap gap-2">
                {statuses.map((status) => (
                    <span key={status} className="flex items-center gap-1">
                        <StatusBadge status={status} />
                        <span>{snapshot.summary[status]}</span>
                    </span>
                ))}
            </div>
        </div>
    );
}
