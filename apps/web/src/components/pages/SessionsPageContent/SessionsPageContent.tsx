'use client';

import { useTranslation } from 'react-i18next';

import { ProjectNav } from '@/components/layout/ProjectNav/ProjectNav';
import { SessionFields } from '@/components/sessions/SessionFields/SessionFields';

export type SessionListItem = { id: string; title: string; performedAt: Date; notes: string | null };

export function SessionsPageContent({
    projectId,
    name,
    sessions,
    createAction,
}: {
    projectId: string;
    name: string;
    sessions: SessionListItem[];
    createAction: (formData: FormData) => void | Promise<void>;
}) {
    const { t } = useTranslation();
    return (
        <>
            <ProjectNav name={name} projectId={projectId} />
            <main className="mx-auto max-w-4xl p-6">
                <h1 className="mb-4 text-2xl font-semibold">{t('sessions.title')}</h1>
                <form action={createAction} className="mb-6 grid gap-2 rounded border border-[var(--border)] p-4">
                    <SessionFields />
                    <button type="submit" className="rounded bg-[var(--accent)] px-3 py-2 text-white">
                        {t('sessions.new')}
                    </button>
                </form>
                <ul className="grid gap-2">
                    {sessions.map((row) => (
                        <li key={row.id} className="rounded border border-[var(--border)] p-3">
                            <strong>{row.title}</strong>
                            <div className="text-sm text-[var(--muted)]">{row.performedAt.toISOString()}</div>
                            {row.notes ? <p>{row.notes}</p> : null}
                        </li>
                    ))}
                </ul>
            </main>
        </>
    );
}
