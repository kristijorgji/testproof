'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { ProjectListRow } from './ProjectListRow';
import { useProjectDeleteAction } from './useProjectDeleteAction';

import { SignOutButton } from '@/components/auth/SignOutButton/SignOutButton';
import { CreateProjectFields } from '@/components/projects/CreateProjectFields/CreateProjectFields';

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
            <form action={createAction} className="mb-6 grid gap-2 rounded border border-[var(--border)] p-4">
                <CreateProjectFields />
                <button type="submit" className="rounded bg-[var(--accent)] px-3 py-2 text-white">
                    {t('projects.create')}
                </button>
            </form>
            {projects.length === 0 ? <p className="text-[var(--muted)]">{t('projects.empty')}</p> : null}
            <ul className="grid gap-2">
                {projects.map((project) => (
                    <ProjectListRow key={project.id} project={project} deleting={deleting} onDelete={requestDelete} />
                ))}
            </ul>
            {confirmDialog}
        </main>
    );
}
