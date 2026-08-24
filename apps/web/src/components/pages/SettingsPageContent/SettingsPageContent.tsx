'use client';

import { useTranslation } from 'react-i18next';

import type { ApiTokenListItem } from '@/actions/settings';
import { ProjectNav } from '@/components/layout/ProjectNav/ProjectNav';
import { RepoForm } from '@/components/settings/RepoForm/RepoForm';
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
    tokens,
    saveRepoAction,
    deleteTokenAction,
}: {
    projectId: string;
    name: string;
    storage: string;
    ledgerPath: string;
    ledgerFilePath: string | null;
    repo: SettingsRepo | null;
    tokens: ApiTokenListItem[];
    saveRepoAction: (formData: FormData) => void | Promise<void>;
    deleteTokenAction: (tokenId: string) => void | Promise<void>;
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
                    <RepoForm repo={repo} saveAction={saveRepoAction} />
                </section>
                <section className="grid gap-2 rounded border border-[var(--border)] p-4">
                    <h2 className="font-medium">{t('settings.apiTokens')}</h2>
                    <TokenForm projectId={projectId} tokens={tokens} deleteAction={deleteTokenAction} />
                </section>
            </main>
        </>
    );
}
