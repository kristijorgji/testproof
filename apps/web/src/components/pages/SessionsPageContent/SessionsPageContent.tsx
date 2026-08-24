'use client';

import { useTranslation } from 'react-i18next';

import { SessionList } from './SessionList';
import { useSessionMutations } from './useSessionMutations';

import { ProjectNav } from '@/components/layout/ProjectNav/ProjectNav';
import { SessionFields } from '@/components/sessions/SessionFields/SessionFields';

export type SessionListItem = { id: string; title: string; performedAt: Date; notes: string | null };

export function SessionsPageContent({
    projectId,
    name,
    sessions,
    createAction,
    deleteAction,
}: {
    projectId: string;
    name: string;
    sessions: SessionListItem[];
    createAction: (formData: FormData) => void | Promise<void>;
    deleteAction: (sessionId: string) => void | Promise<void>;
}) {
    const { t } = useTranslation();
    const { pending, submitCreate, confirmDelete } = useSessionMutations(createAction, deleteAction);

    return (
        <>
            <ProjectNav name={name} projectId={projectId} />
            <main className="mx-auto max-w-4xl p-6">
                <h1 className="mb-4 text-2xl font-semibold">{t('sessions.title')}</h1>
                <form
                    className="mb-6 grid gap-2 rounded border border-[var(--border)] p-4"
                    onSubmit={(event) => {
                        event.preventDefault();
                        submitCreate(event.currentTarget);
                    }}
                >
                    <SessionFields />
                    <button
                        type="submit"
                        disabled={pending}
                        className="rounded bg-[var(--accent)] px-3 py-2 text-white disabled:opacity-60"
                    >
                        {pending ? t('common.working') : t('sessions.new')}
                    </button>
                </form>
                <SessionList sessions={sessions} pending={pending} onDelete={confirmDelete} />
            </main>
        </>
    );
}
