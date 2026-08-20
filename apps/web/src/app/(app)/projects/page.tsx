import { projects } from '@testproof/db';
import Link from 'next/link';

import { createProject } from '@/actions/projects';
import { SignOutButton } from '@/components/auth/SignOutButton';
import { CreateProjectFields } from '@/components/projects/CreateProjectFields';
import { getLocaleFromCookie } from '@/i18n/get-locale';
import { getServerTranslation } from '@/i18n/server';
import { getDb } from '@/server/db';
import { requireUser } from '@/server/session';

export default async function ProjectsPage() {
    await requireUser();
    const { t } = await getServerTranslation(await getLocaleFromCookie());
    let rows: Array<{ id: string; name: string; slug: string }> = [];
    try {
        rows = await getDb().select().from(projects);
    } catch {
        // Keep the empty list when the database is not available.
    }
    return (
        <main className="mx-auto max-w-3xl p-6">
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-2xl font-semibold">{t('projects.title')}</h1>
                <SignOutButton />
            </div>
            <form action={createProject} className="mb-6 grid gap-2 rounded border border-[var(--border)] p-4">
                <CreateProjectFields />
                <button type="submit" className="rounded bg-[var(--accent)] px-3 py-2 text-white">
                    {t('projects.create')}
                </button>
            </form>
            {rows.length === 0 ? <p className="text-[var(--muted)]">{t('projects.empty')}</p> : null}
            <ul className="grid gap-2">
                {rows.map((project) => (
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
