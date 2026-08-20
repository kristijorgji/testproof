import { sessions } from '@testproof/db';
import { desc, eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';

import { createSession } from '@/actions/sessions';
import { T } from '@/components/i18n/T';
import { ProjectNav } from '@/components/layout/ProjectNav';
import { SessionFields } from '@/components/sessions/SessionFields';
import { getProject } from '@/server/project';
import { getDb } from '@/server/db';
import { requireUser } from '@/server/session';

export default async function SessionsPage({ params }: { params: Promise<{ projectId: string }> }) {
    await requireUser();
    const { projectId } = await params;
    const project = await getProject(projectId);
    if (!project) notFound();
    let rows: Array<{ id: string; title: string; performedAt: Date; notes: string | null }> = [];
    try {
        rows = await getDb().select().from(sessions).where(eq(sessions.projectId, projectId)).orderBy(desc(sessions.performedAt));
    } catch {
        rows = [];
    }
    const action = createSession.bind(null, projectId);
    return (
        <>
            <ProjectNav projectId={projectId} name={project.name} />
            <main className="mx-auto max-w-4xl p-6">
                <h1 className="mb-4 text-2xl font-semibold">
                    <T k="sessions.title" />
                </h1>
                <form action={action} className="mb-6 grid gap-2 rounded border border-[var(--border)] p-4">
                    <SessionFields />
                    <button type="submit" className="rounded bg-[var(--accent)] px-3 py-2 text-white">
                        <T k="sessions.new" />
                    </button>
                </form>
                <ul className="grid gap-2">
                    {rows.map((row) => (
                        <li key={row.id} className="rounded border border-[var(--border)] p-3">
                            <strong>{row.title}</strong>
                            <div className="text-sm text-[var(--muted)]">{row.performedAt.toISOString()}</div>
                            {row.notes ? <p>{row.notes}</p> : null}
                        </li>
                    ))}
                </ul>
            </main>
        </>
    );
}
