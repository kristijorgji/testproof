'use client';

import { useTranslation } from 'react-i18next';

import { ProjectNav } from '@/components/layout/ProjectNav/ProjectNav';
import { StorageForm } from '@/components/settings/StorageForm/StorageForm';
import { TokenForm } from '@/components/settings/TokenForm/TokenForm';

export type SettingsRepo = { owner: string; name: string };

export function SettingsPageContent({
    projectId,
    name,
    storage,
    ledgerPath,
    ledgerFilePath,
    repo,
    saveRepoAction,
}: {
    projectId: string;
    name: string;
    storage: string;
    ledgerPath: string;
    ledgerFilePath: string | null;
    repo: SettingsRepo | null;
    saveRepoAction: (formData: FormData) => void | Promise<void>;
}) {
    const { t } = useTranslation();
    return (
        <>
            <ProjectNav name={name} projectId={projectId} />
            <main className="mx-auto max-w-2xl p-6">
                <h1 className="mb-4 text-2xl font-semibold">{t('settings.title')}</h1>
                <section className="mb-6 grid gap-2 rounded border border-[var(--border)] p-4">
                    <h2 className="font-medium">{t('settings.storage')}</h2>
                    <StorageForm
                        projectId={projectId}
                        storage={storage}
                        ledgerPath={ledgerPath}
                        ledgerFilePath={ledgerFilePath}
                    />
                </section>
                <section className="mb-6 grid gap-2 rounded border border-[var(--border)] p-4">
                    <h2 className="font-medium">{t('settings.repo')}</h2>
                    <form action={saveRepoAction} className="grid gap-2">
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
                            {t('settings.saveRepo')}
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
