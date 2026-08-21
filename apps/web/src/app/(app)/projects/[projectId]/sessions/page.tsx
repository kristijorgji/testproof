import { sessions } from '@testproof/db';
import { desc, eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';

import { createSession } from '@/actions/sessions';
import { type SessionListItem, SessionsPageContent } from '@/components/pages/SessionsPageContent/SessionsPageContent';
import { getDb } from '@/server/db';
import { getProject } from '@/server/project';
import { requireUser } from '@/server/session';

export default async function SessionsPage({ params }: { params: Promise<{ projectId: string }> }) {
    await requireUser();
    const { projectId } = await params;
    const project = await getProject(projectId);
    if (!project) notFound();
    let rows: SessionListItem[] = [];
    try {
        rows = await getDb()
            .select()
            .from(sessions)
            .where(eq(sessions.projectId, projectId))
            .orderBy(desc(sessions.performedAt));
    } catch {
        // Keep the empty list when the database is not available.
    }
    return (
        <SessionsPageContent
            name={project.name}
            projectId={projectId}
            sessions={rows}
            createAction={createSession.bind(null, projectId)}
        />
    );
}
