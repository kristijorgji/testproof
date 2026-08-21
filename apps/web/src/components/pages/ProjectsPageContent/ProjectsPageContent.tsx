'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { SignOutButton } from '@/components/auth/SignOutButton/SignOutButton';
import { CreateProjectFields } from '@/components/projects/CreateProjectFields/CreateProjectFields';

export type ProjectListItem = { id: string; name: string; slug: string };

export function ProjectsPageContent({
    projects,
    createAction,
}: {
    projects: ProjectListItem[];
    createAction: (formData: FormData) => void | Promise<void>;
}) {
    const { t } = useTranslation();
    return (
        <main className="mx-auto max-w-3xl p-6">
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-2xl font-semibold">{t('projects.title')}</h1>
                <SignOutButton />
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
                    <li key={project.id}>
                        <Link
                            className="block rounded border border-[var(--border)] p-3"
                            href={`/projects/${project.id}`}
                        >
                            {project.name} <span className="text-[var(--muted)]">/{project.slug}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </main>
    );
}
