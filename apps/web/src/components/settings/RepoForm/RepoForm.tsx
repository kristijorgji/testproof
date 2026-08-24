'use client';

import { useTranslation } from 'react-i18next';

import { useRepoForm } from './useRepoForm';

import type { SettingsRepo } from '@/components/pages/SettingsPageContent/SettingsPageContent';

export function RepoForm({
    repo,
    saveAction,
}: {
    repo: SettingsRepo | null;
    saveAction: (formData: FormData) => void | Promise<void>;
}) {
    const { t } = useTranslation();
    const { error, pending, workingLabel, onSubmit } = useRepoForm(saveAction);

    return (
        <form
            className="grid gap-2"
            aria-busy={pending}
            onSubmit={(event) => {
                event.preventDefault();
                onSubmit(event.currentTarget);
            }}
        >
            <input
                name="owner"
                defaultValue={repo?.owner}
                required
                disabled={pending}
                placeholder={t('settings.owner')}
                className="rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2 disabled:opacity-60"
            />
            <input
                name="name"
                defaultValue={repo?.name}
                required
                disabled={pending}
                placeholder={t('settings.repoName')}
                className="rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2 disabled:opacity-60"
            />
            <button
                type="submit"
                disabled={pending}
                className="rounded bg-[var(--accent)] px-3 py-2 text-white disabled:opacity-60"
            >
                {pending ? workingLabel : t('settings.saveRepo')}
            </button>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </form>
    );
}
