import { runs } from '@testproof/db';
import { desc, eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';

import { type RunListItem, RunsPageContent } from '@/components/pages/RunsPageContent/RunsPageContent';
import { getDb } from '@/server/db';
import { getProject } from '@/server/project';
import { requireUser } from '@/server/session';

export default async function RunsPage({ params }: { params: Promise<{ projectId: string }> }) {
    await requireUser();
    const { projectId } = await params;
    const project = await getProject(projectId);
    if (!project) notFound();
    let rows: RunListItem[] = [];
    try {
        rows = await getDb().select().from(runs).where(eq(runs.projectId, projectId)).orderBy(desc(runs.createdAt));
    } catch {
        // Keep the empty list when the database is not available.
    }
    return <RunsPageContent name={project.name} projectId={projectId} runs={rows} />;
}
