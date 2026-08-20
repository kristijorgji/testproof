import { runs } from '@testproof/db';
import { desc, eq } from 'drizzle-orm';
import Link from 'next/link';

import { getDb } from '@/server/db';

export default async function RunsPage({ params }: { params: Promise<{ projectId: string }> }) {
    const { projectId } = await params;
    let rows: Array<{ id: string; source: string; status: string; createdAt: Date }> = [];
    try {
        rows = await getDb().select().from(runs).where(eq(runs.projectId, projectId)).orderBy(desc(runs.createdAt));
    } catch {
        rows = [];
    }
    return (
        <main className="mx-auto max-w-4xl p-6">
            <h1 className="mb-4 text-2xl font-semibold">Runs</h1>
            <ul className="grid gap-2">
                {rows.map((run) => (
                    <li key={run.id}>
                        <Link className="block rounded border border-[var(--border)] p-3" href={`/projects/${projectId}/runs/${run.id}`}>
                            {run.source} · {run.status} · {run.createdAt.toISOString()}
                        </Link>
                    </li>
                ))}
            </ul>
        </main>
    );
}
