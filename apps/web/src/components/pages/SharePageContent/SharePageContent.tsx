'use client';

import type { CoverageStatus } from '@testproof/core';
import { useTranslation } from 'react-i18next';

import { StatusBadge } from '@/components/status/StatusBadge/StatusBadge';

export type ShareCoverageRow = { flowId: string; status: string };

export function SharePageContent({ rows }: { rows: ShareCoverageRow[] }) {
    const { t } = useTranslation();
    return (
        <main className="mx-auto max-w-3xl p-6">
            <h1 className="mb-4 text-2xl font-semibold">{t('share.coverageTitle')}</h1>
            <ul className="grid gap-2">
                {rows.map((row) => (
                    <li key={row.flowId} className="flex items-center gap-2">
                        <StatusBadge status={row.status as CoverageStatus} />
                        <code>{row.flowId}</code>
                    </li>
                ))}
            </ul>
        </main>
    );
}
