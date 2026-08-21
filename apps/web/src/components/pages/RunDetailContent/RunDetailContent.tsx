'use client';

import { useTranslation } from 'react-i18next';

export type RunResultItem = { id: string; flowId: string | null; platform: string | null; status: string };

export function RunDetailContent({ results }: { results: RunResultItem[] }) {
    const { t } = useTranslation();
    const untagged = results.filter((row) => !row.flowId);
    return (
        <main className="mx-auto max-w-4xl p-6">
            <h1 className="mb-4 text-2xl font-semibold">{t('runs.detail')}</h1>
            <ul className="grid gap-2">
                {results.map((row) => (
                    <li key={row.id} className="rounded border border-[var(--border)] p-2 text-sm">
                        {row.flowId ?? 'untagged'} · {row.platform ?? '—'} · {row.status}
                    </li>
                ))}
            </ul>
            {untagged.length > 0 ? (
                <p className="mt-4 text-sm text-[var(--muted)]">{t('runs.untagged', { count: untagged.length })}</p>
            ) : null}
        </main>
    );
}
