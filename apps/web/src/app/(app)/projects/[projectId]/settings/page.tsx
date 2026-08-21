import { notFound } from 'next/navigation';

import { saveRepo } from '@/actions/settings';
import { SettingsPageContent } from '@/components/pages/SettingsPageContent/SettingsPageContent';
import { getProject, getProjectRepo } from '@/server/project';
import { requireUser } from '@/server/session';

export default async function SettingsPage({ params }: { params: Promise<{ projectId: string }> }) {
    await requireUser();
    const { projectId } = await params;
    const project = await getProject(projectId);
    if (!project) notFound();
    const repo = await getProjectRepo(projectId);
    return (
        <SettingsPageContent
            name={project.name}
            projectId={projectId}
            storage={project.storage}
            ledgerPath={project.ledgerPath}
            ledgerFilePath={project.ledgerFilePath}
            repo={repo ? { owner: repo.owner, name: repo.name } : null}
            saveRepoAction={saveRepo.bind(null, projectId)}
        />
    );
}
