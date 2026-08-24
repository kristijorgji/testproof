'use client';

import type { Ledger } from '@testproof/core';
import { flattenFlows } from '@testproof/core/parse';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { StatusBadge } from '@/components/status/StatusBadge/StatusBadge';
import type { CoverageRow } from '@/lib/coverage-types';

import { formatCoverageCell } from './coverage-filters';

export function CoverageFlowPanel({
    ledger,
    coverage,
    selectedFlowId,
}: {
    ledger: Ledger;
    coverage: Record<string, CoverageRow>;
    selectedFlowId: string | undefined;
}) {
    const { t } = useTranslation();
    const flow = useMemo(() => {
        if (!selectedFlowId) return undefined;
        return flattenFlows(ledger).find((item) => item.id === selectedFlowId);
    }, [ledger, selectedFlowId]);

    if (!flow) {
        return (
            <div className="rounded border border-[var(--border)] p-4 text-sm text-[var(--muted)]">
                {t('coverage.selectFlow')}
            </div>
        );
    }

    const row = coverage[flow.id];
    const status = row?.status ?? 'todo';
    const fileEntries = Object.entries(row?.files ?? {}).sort(([a], [b]) => a.localeCompare(b));
    const hasFiles = fileEntries.some(([, files]) => files.length > 0);

    return (
        <section className="grid gap-4 rounded border border-[var(--border)] p-4">
            <div className="grid gap-1">
                <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={status} />
                    <code className="text-xs">{flow.id}</code>
                </div>
                <h2 className="text-lg font-medium">{flow.title}</h2>
            </div>
            <div>
                <h3 className="mb-1 text-sm font-medium">{t('coverage.demanded')}</h3>
                {row?.demanded.length ? (
                    <ul className="grid gap-1 text-sm">
                        {row.demanded.map((cell, index) => (
                            <li key={`d-${index}`}>{formatCoverageCell(cell)}</li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-[var(--muted)]">—</p>
                )}
            </div>
            <div>
                <h3 className="mb-1 text-sm font-medium">{t('coverage.covered')}</h3>
                {row?.covered.length ? (
                    <ul className="grid gap-1 text-sm">
                        {row.covered.map((cell, index) => (
                            <li key={`c-${index}`}>{formatCoverageCell(cell)}</li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-[var(--muted)]">—</p>
                )}
            </div>
            <div>
                <h3 className="mb-1 text-sm font-medium">{t('coverage.testFiles')}</h3>
                {!hasFiles ? (
                    <p className="text-sm text-[var(--muted)]">{t('coverage.noTestFiles')}</p>
                ) : (
                    <div className="grid gap-3 text-sm">
                        {fileEntries.map(([platform, files]) => (
                            <div key={platform}>
                                <div className="font-medium">{platform}</div>
                                {files.length ? (
                                    <ul className="grid gap-1 pl-2">
                                        {files.map((file) => (
                                            <li key={file}>
                                                <code className="text-xs">{file}</code>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="pl-2 text-[var(--muted)]">—</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
