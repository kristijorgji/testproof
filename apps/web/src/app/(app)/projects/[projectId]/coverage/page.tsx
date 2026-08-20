import { coverageSnapshots, flowCoverage } from '@testproof/db';
import { desc, eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';

import { T } from '@/components/i18n/T';
import { ProjectNav } from '@/components/layout/ProjectNav';
import { StatusBadge } from '@/components/status/StatusBadge';
import { getProject } from '@/server/project';
import { getDb } from '@/server/db';
import { requireUser } from '@/server/session';

export default async function CoveragePage({ params }: { params: Promise<{ projectId: string }> }) {
    await requireUser();
    const { projectId } = await params;
    const project = await getProject(projectId);
    if (!project) notFound();
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
        <>
            <ProjectNav projectId={projectId} name={project.name} />
            <main className="mx-auto max-w-4xl p-6">
                <h1 className="mb-4 text-2xl font-semibold">
                    <T k="coverage.title" />
                </h1>
                {rows.length === 0 ? (
                    <p className="text-[var(--muted)]">
                        <T k="coverage.empty" />
                    </p>
                ) : null}
                <ul className="grid gap-2">
                    {rows.map((row) => (
                        <li key={row.flowId} className="flex items-center gap-2 rounded border border-[var(--border)] p-2">
                            <StatusBadge status={row.status as 'automated' | 'partial' | 'todo' | 'manual'} />
                            <code>{row.flowId}</code>
                        </li>
                    ))}
                </ul>
            </main>
        </>
    );
}
