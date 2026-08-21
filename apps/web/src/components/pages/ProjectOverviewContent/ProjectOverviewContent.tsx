'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { ProjectNav } from '@/components/layout/ProjectNav/ProjectNav';

export function ProjectOverviewContent({ projectId, name }: { projectId: string; name: string }) {
    const { t } = useTranslation();
    const links = [
        ['nav.flows', 'flows'],
        ['nav.coverage', 'coverage'],
        ['nav.runs', 'runs'],
        ['nav.sessions', 'sessions'],
        ['nav.settings', 'settings'],
    ] as const;
    return (
        <>
            <ProjectNav name={name} projectId={projectId} />
            <main className="mx-auto max-w-3xl p-6">
                <h1 className="mb-4 text-2xl font-semibold">{name}</h1>
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
