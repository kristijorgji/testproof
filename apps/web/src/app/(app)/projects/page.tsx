import { projects } from '@testproof/db';
import Link from 'next/link';

import { getDb } from '@/server/db';

export default async function ProjectsPage() {
    let rows: Array<{ id: string; name: string; slug: string }> = [];
    try {
        rows = await getDb().select().from(projects);
    } catch {
        rows = [];
    }
    return (
        <main className="mx-auto max-w-3xl p-6">
            <h1 className="mb-4 text-2xl font-semibold">Projects</h1>
            {rows.length === 0 ? <p className="text-[var(--muted)]">No projects yet. Create one after connecting the database.</p> : null}
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
