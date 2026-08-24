import { projects } from '@testproof/db';

import { createProject, deleteProject } from '@/actions/projects';
import { type ProjectListItem, ProjectsPageContent } from '@/components/pages/ProjectsPageContent/ProjectsPageContent';
import { getDb } from '@/server/db';
import { requireUser } from '@/server/session';

export default async function ProjectsPage() {
    await requireUser();
    let rows: ProjectListItem[] = [];
    try {
        rows = await getDb().select().from(projects);
    } catch {
        // Keep the empty list when the database is not available.
    }
    return <ProjectsPageContent projects={rows} createAction={createProject} deleteAction={deleteProject} />;
}
