import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ProjectNav } from '@/components/layout/ProjectNav';
import { getLocaleFromCookie } from '@/i18n/get-locale';
import { getServerTranslation } from '@/i18n/server';
import { getProject } from '@/server/project';
import { requireUser } from '@/server/session';

export default async function ProjectOverview({ params }: { params: Promise<{ projectId: string }> }) {
    await requireUser();
    const { t } = await getServerTranslation(await getLocaleFromCookie());
    const { projectId } = await params;
    const project = await getProject(projectId);
    if (!project) notFound();
    const links = [
        ['nav.flows', 'flows'],
        ['nav.coverage', 'coverage'],
        ['nav.runs', 'runs'],
        ['nav.sessions', 'sessions'],
        ['nav.settings', 'settings'],
    ] as const;
    return (
        <>
            <ProjectNav name={project.name} projectId={projectId} />
            <main className="mx-auto max-w-3xl p-6">
                <h1 className="mb-4 text-2xl font-semibold">{project.name}</h1>
                <nav className="grid gap-2">
                    {links.map(([key, href]) => (
                        <Link
                            key={href}
                            className="rounded border border-[var(--border)] p-3"
                            href={`/projects/${projectId}/${href}`}
                        >
                            {t(key)}
                        </Link>
                    ))}
                </nav>
            </main>
        </>
    );
}
