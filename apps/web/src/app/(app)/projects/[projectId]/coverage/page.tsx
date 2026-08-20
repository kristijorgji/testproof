import { coverageSnapshots, flowCoverage } from '@testproof/db';
import { desc, eq } from 'drizzle-orm';

import { StatusBadge } from '@/components/status/StatusBadge';
import { getDb } from '@/server/db';

export default async function CoveragePage({ params }: { params: Promise<{ projectId: string }> }) {
    const { projectId } = await params;
    let rows: Array<{ flowId: string; status: string }> = [];
    try {
        const [snapshot] = await getDb()
            .select()
            .from(coverageSnapshots)
            .where(eq(coverageSnapshots.projectId, projectId))
            .orderBy(desc(coverageSnapshots.createdAt))
            .limit(1);
        if (snapshot) {
            rows = await getDb().select().from(flowCoverage).where(eq(flowCoverage.snapshotId, snapshot.id));
        }
    } catch {
        rows = [];
    }
    return (
        <main className="mx-auto max-w-4xl p-6">
            <h1 className="mb-4 text-2xl font-semibold">Coverage</h1>
            {rows.length === 0 ? <p className="text-[var(--muted)]">No coverage snapshot yet. Run `testproof push` from CI.</p> : null}
            <ul className="grid gap-2">
                {rows.map((row) => (
                    <li key={row.flowId} className="flex items-center gap-2 rounded border border-[var(--border)] p-2">
                        <StatusBadge status={row.status as 'automated' | 'partial' | 'todo' | 'manual'} />
                        <code>{row.flowId}</code>
                    </li>
                ))}
            </ul>
        </main>
    );
}
