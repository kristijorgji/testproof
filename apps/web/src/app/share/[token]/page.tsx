import { coverageSnapshots, flowCoverage, projects } from '@testproof/db';
import { desc, eq } from 'drizzle-orm';

import { StatusBadge } from '@/components/status/StatusBadge/StatusBadge';
import { getLocaleFromCookie } from '@/i18n/get-locale';
import { getServerTranslation } from '@/i18n/server';
import { getDb } from '@/server/db';

export const metadata = { robots: { index: false, follow: false } };

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
    const { t } = await getServerTranslation(await getLocaleFromCookie());
    const { token } = await params;
    let rows: Array<{ flowId: string; status: string }> = [];
    try {
        const [project] = await getDb().select().from(projects).where(eq(projects.shareToken, token)).limit(1);
        if (project) {
            const [snapshot] = await getDb()
                .select()
                .from(coverageSnapshots)
                .where(eq(coverageSnapshots.projectId, project.id))
                .orderBy(desc(coverageSnapshots.createdAt))
                .limit(1);
            if (snapshot) {
                rows = await getDb().select().from(flowCoverage).where(eq(flowCoverage.snapshotId, snapshot.id));
            }
        }
    } catch {
        rows = [];
    }
    return (
        <main className="mx-auto max-w-3xl p-6">
            <h1 className="mb-4 text-2xl font-semibold">{t('share.coverageTitle')}</h1>
            <ul className="grid gap-2">
                {rows.map((row) => (
                    <li key={row.flowId} className="flex items-center gap-2">
                        <StatusBadge status={row.status as 'automated' | 'partial' | 'todo' | 'manual'} />
                        <code>{row.flowId}</code>
                    </li>
                ))}
            </ul>
        </main>
    );
}
