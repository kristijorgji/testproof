import { projects } from '@testproof/db';
import Link from 'next/link';

import { createProject } from '@/actions/projects';
import { SignOutButton } from '@/components/auth/SignOutButton';
import { T } from '@/components/i18n/T';
import { CreateProjectFields } from '@/components/projects/CreateProjectFields';
import { getDb } from '@/server/db';
import { requireUser } from '@/server/session';

export default async function ProjectsPage() {
    await requireUser();
    let rows: Array<{ id: string; name: string; slug: string }> = [];
    try {
        rows = await getDb().select().from(projects);
    } catch {
        rows = [];
    }
    return (
        <main className="mx-auto max-w-3xl p-6">
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-2xl font-semibold">
                    <T k="projects.title" />
                </h1>
                <SignOutButton />
            </div>
            <form action={createProject} className="mb-6 grid gap-2 rounded border border-[var(--border)] p-4">
                <CreateProjectFields />
                <button type="submit" className="rounded bg-[var(--accent)] px-3 py-2 text-white">
                    <T k="projects.create" />
                </button>
            </form>
            {rows.length === 0 ? (
                <p className="text-[var(--muted)]">
                    <T k="projects.empty" />
                </p>
            ) : null}
            <ul className="grid gap-2">
                {rows.map((project) => (
                    <li key={project.id}>
                        <Link className="block rounded border border-[var(--border)] p-3" href={`/projects/${project.id}`}>
                            {project.name} <span className="text-[var(--muted)]">/{project.slug}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </main>
    );
}
