'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { exportLedger, saveStorage } from '@/actions/settings';

export function StorageForm({
    projectId,
    storage,
    ledgerPath,
    ledgerFilePath,
}: {
    projectId: string;
    storage: string;
    ledgerPath: string;
    ledgerFilePath: string | null;
}) {
    const { t } = useTranslation();
    const [mode, setMode] = useState(storage);
    const [error, setError] = useState<string | null>(null);

    return (
        <form
            className="grid gap-2"
            onSubmit={(event) => {
                event.preventDefault();
                setError(null);
                const form = new FormData(event.currentTarget);
                void saveStorage(projectId, form).catch((caught: unknown) => {
                    setError(caught instanceof Error ? caught.message : String(caught));
                });
            }}
        >
            <label className="text-sm">{t('settings.storage')}</label>
            <select
                name="storage"
                value={mode}
                className="rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
                onChange={(event) => setMode(event.target.value)}
            >
                <option value="git">{t('settings.storageGit')}</option>
                <option value="file">{t('settings.storageFile')}</option>
                <option value="db">{t('settings.storageDb')}</option>
            </select>
            <p className="text-sm text-[var(--muted)]">
                {mode === 'file'
                    ? t('settings.storageHelpFile')
                    : mode === 'db'
                      ? t('settings.storageHelpDb')
                      : t('settings.storageHelpGit')}
            </p>
            {mode === 'git' ? (
                <label className="grid gap-1 text-sm">
                    {t('settings.ledgerPath')}
                    <input
                        name="ledgerPath"
                        defaultValue={ledgerPath}
                        className="rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
                    />
                </label>
            ) : null}
            {mode === 'file' ? (
                <label className="grid gap-1 text-sm">
                    {t('settings.ledgerFilePath')}
                    <input
                        name="ledgerFilePath"
                        defaultValue={ledgerFilePath ?? ''}
                        className="rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
                    />
                </label>
            ) : null}
            {mode === 'db' ? <p className="text-sm text-[var(--muted)]">{t('settings.storageDbNote')}</p> : null}
            <button type="submit" className="rounded bg-[var(--accent)] px-3 py-2 text-white">
                {t('settings.saveStorage')}
            </button>
            {mode === 'db' ? (
                <button
                    type="button"
                    className="rounded border border-[var(--border)] px-3 py-2"
                    onClick={() => {
                        void exportLedger(projectId).then((yaml) => {
                            const blob = new Blob([yaml], { type: 'text/yaml' });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = 'flows.yaml';
                            link.click();
                            URL.revokeObjectURL(url);
                        });
                    }}
                >
                    {t('settings.exportYaml')}
                </button>
            ) : null}
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </form>
    );
}
