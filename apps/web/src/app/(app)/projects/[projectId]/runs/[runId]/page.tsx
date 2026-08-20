import { runResults } from '@testproof/db';
import { eq } from 'drizzle-orm';

import { getLocaleFromCookie } from '@/i18n/get-locale';
import { getServerTranslation } from '@/i18n/server';
import { getDb } from '@/server/db';

export default async function RunDetailPage({ params }: { params: Promise<{ runId: string }> }) {
    const { t } = await getServerTranslation(await getLocaleFromCookie());
    const { runId } = await params;
    let rows: Array<{ id: string; flowId: string | null; platform: string | null; status: string }> = [];
    try {
        rows = await getDb().select().from(runResults).where(eq(runResults.runId, runId));
    } catch {
        // Keep the empty list when the database is not available.
    }
    const untagged = rows.filter((r) => !r.flowId);
    return (
        <main className="mx-auto max-w-4xl p-6">
            <h1 className="mb-4 text-2xl font-semibold">{t('runs.detail')}</h1>
            <ul className="grid gap-2">
                {rows.map((row) => (
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
