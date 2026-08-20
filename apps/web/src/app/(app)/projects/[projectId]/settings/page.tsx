import { notFound } from 'next/navigation';

import { saveRepo } from '@/actions/settings';
import { T } from '@/components/i18n/T';
import { ProjectNav } from '@/components/layout/ProjectNav';
import { TokenForm } from '@/components/settings/TokenForm';
import { getProject, getProjectRepo } from '@/server/project';
import { requireUser } from '@/server/session';

export default async function SettingsPage({ params }: { params: Promise<{ projectId: string }> }) {
    await requireUser();
    const { projectId } = await params;
    const project = await getProject(projectId);
    if (!project) notFound();
    const repo = await getProjectRepo(projectId);
    const save = saveRepo.bind(null, projectId);
    return (
        <>
            <ProjectNav name={project.name} projectId={projectId} />
            <main className="mx-auto max-w-2xl p-6">
                <h1 className="mb-4 text-2xl font-semibold">
                    <T k="settings.title" />
                </h1>
                <section className="mb-6 grid gap-2 rounded border border-[var(--border)] p-4">
                    <h2 className="font-medium">
                        <T k="settings.repo" />
                    </h2>
                    <form action={save} className="grid gap-2">
                        <input
                            name="owner"
                            defaultValue={repo?.owner}
                            required
                            className="rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
                        />
                        <input
                            name="name"
                            defaultValue={repo?.name}
                            required
                            className="rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
                        />
                        <button type="submit" className="rounded bg-[var(--accent)] px-3 py-2 text-white">
                            <T k="settings.saveRepo" />
                        </button>
                    </form>
                </section>
                <section className="grid gap-2 rounded border border-[var(--border)] p-4">
                    <TokenForm projectId={projectId} />
                </section>
            </main>
        </>
    );
}
