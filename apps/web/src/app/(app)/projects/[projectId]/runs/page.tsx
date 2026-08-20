import { runs } from '@testproof/db';
import { desc, eq } from 'drizzle-orm';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { T } from '@/components/i18n/T';
import { ProjectNav } from '@/components/layout/ProjectNav';
import { getDb } from '@/server/db';
import { getProject } from '@/server/project';
import { requireUser } from '@/server/session';

export default async function RunsPage({ params }: { params: Promise<{ projectId: string }> }) {
    await requireUser();
    const { projectId } = await params;
    const project = await getProject(projectId);
    if (!project) notFound();
    let rows: Array<{ id: string; source: string; status: string; createdAt: Date }> = [];
    try {
        rows = await getDb().select().from(runs).where(eq(runs.projectId, projectId)).orderBy(desc(runs.createdAt));
    } catch {
        // Keep the empty list when the database is not available.
    }
    return (
        <>
            <ProjectNav name={project.name} projectId={projectId} />
            <main className="mx-auto max-w-4xl p-6">
                <h1 className="mb-4 text-2xl font-semibold">
                    <T k="runs.title" />
                </h1>
                <ul className="grid gap-2">
                    {rows.map((run) => (
                        <li key={run.id}>
                            <Link
                                className="block rounded border border-[var(--border)] p-3"
                                href={`/projects/${projectId}/runs/${run.id}`}
                            >
                                {run.source} · {run.status} · {run.createdAt.toISOString()}
                            </Link>
                        </li>
                    ))}
                </ul>
            </main>
        </>
    );
}
