'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ProjectListRow } from './ProjectListRow';
import { useProjectDeleteAction } from './useProjectDeleteAction';

import { SignOutButton } from '@/components/auth/SignOutButton/SignOutButton';
import { CreateProjectFields } from '@/components/projects/CreateProjectFields/CreateProjectFields';
import { clearPreferredProjectId, syncPreferredProjectId, writePreferredProjectId } from '@/lib/preferred-project';

export type { ProjectListItem } from './ProjectListRow';

export function ProjectsPageContent({
    projects,
    createAction,
    deleteAction,
}: {
    projects: { id: string; name: string; slug: string }[];
    createAction: (formData: FormData) => void | Promise<void>;
    deleteAction: (projectId: string) => void | Promise<void>;
}) {
    const { t } = useTranslation();
    const { deleting, requestDelete, confirmDialog } = useProjectDeleteAction(deleteAction);
    const [preferredId, setPreferredId] = useState<string | null>(null);

    useEffect(() => {
        setPreferredId(syncPreferredProjectId(projects.map((project) => project.id)));
    }, [projects]);

    return (
        <main className="mx-auto max-w-3xl p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
                <h1 className="text-2xl font-semibold">{t('projects.title')}</h1>
                <div className="flex items-center gap-3">
                    <Link href="/about" className="text-sm">
                        {t('nav.about')}
                    </Link>
                    <SignOutButton />
                </div>
            </div>
            {projects.length === 0 ? <p className="mb-6 text-[var(--muted)]">{t('projects.empty')}</p> : null}
            <ul className="mb-6 grid gap-2">
                {projects.map((project) => (
                    <ProjectListRow
                        key={project.id}
                        project={project}
                        preferred={preferredId === project.id}
                        deleting={deleting}
                        onDelete={requestDelete}
                        onSetPreferred={() => {
                            writePreferredProjectId(project.id);
                            setPreferredId(project.id);
                        }}
                        onClearPreferred={() => {
                            clearPreferredProjectId();
                            setPreferredId(null);
                        }}
                    />
                ))}
            </ul>
            <form action={createAction} className="grid gap-2 rounded border border-[var(--border)] p-4">
                <h2 className="text-sm font-medium text-[var(--muted)]">{t('projects.createHeading')}</h2>
                <CreateProjectFields />
                <button type="submit" className="rounded bg-[var(--accent)] px-3 py-2 text-white">
                    {t('projects.create')}
                </button>
            </form>
            {confirmDialog}
        </main>
    );
}
