import { notFound } from 'next/navigation';

import { ProjectOverviewContent } from '@/components/pages/ProjectOverviewContent/ProjectOverviewContent';
import { getProject } from '@/server/project';
import { requireUser } from '@/server/session';

export default async function ProjectOverview({ params }: { params: Promise<{ projectId: string }> }) {
    await requireUser();
    const { projectId } = await params;
    const project = await getProject(projectId);
    if (!project) notFound();
    return <ProjectOverviewContent name={project.name} projectId={projectId} />;
}
