import { sessions } from '@testproof/db';
import { desc, eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';

import { createSession } from '@/actions/sessions';
import { ProjectNav } from '@/components/layout/ProjectNav/ProjectNav';
import { SessionFields } from '@/components/sessions/SessionFields/SessionFields';
import { getLocaleFromCookie } from '@/i18n/get-locale';
import { getServerTranslation } from '@/i18n/server';
import { getDb } from '@/server/db';
import { getProject } from '@/server/project';
import { requireUser } from '@/server/session';

export default async function SessionsPage({ params }: { params: Promise<{ projectId: string }> }) {
    await requireUser();
    const { t } = await getServerTranslation(await getLocaleFromCookie());
    const { projectId } = await params;
    const project = await getProject(projectId);
    if (!project) notFound();
    let rows: Array<{ id: string; title: string; performedAt: Date; notes: string | null }> = [];
    try {
        rows = await getDb()
            .select()
            .from(sessions)
            .where(eq(sessions.projectId, projectId))
            .orderBy(desc(sessions.performedAt));
    } catch {
        // Keep the empty list when the database is not available.
    }
    const action = createSession.bind(null, projectId);
    return (
        <>
            <ProjectNav name={project.name} projectId={projectId} />
            <main className="mx-auto max-w-4xl p-6">
                <h1 className="mb-4 text-2xl font-semibold">{t('sessions.title')}</h1>
                <form action={action} className="mb-6 grid gap-2 rounded border border-[var(--border)] p-4">
                    <SessionFields />
                    <button type="submit" className="rounded bg-[var(--accent)] px-3 py-2 text-white">
                        {t('sessions.new')}
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
