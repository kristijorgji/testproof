'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { ProjectNav } from '@/components/layout/ProjectNav/ProjectNav';

export type RunListItem = { id: string; source: string; status: string; createdAt: Date };

export function RunsPageContent({ projectId, name, runs }: { projectId: string; name: string; runs: RunListItem[] }) {
    const { t } = useTranslation();
    return (
        <>
            <ProjectNav name={name} projectId={projectId} />
            <main className="mx-auto max-w-4xl p-6">
                <h1 className="mb-4 text-2xl font-semibold">{t('runs.title')}</h1>
                <ul className="grid gap-2">
                    {runs.map((run) => (
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
