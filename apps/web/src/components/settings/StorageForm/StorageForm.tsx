'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { downloadYaml } from './downloadYaml';
import { StorageModeFields } from './StorageModeFields';

import { exportLedger, saveStorage } from '@/actions/storage';

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
            <StorageModeFields mode={mode} ledgerPath={ledgerPath} ledgerFilePath={ledgerFilePath} />
            <button type="submit" className="rounded bg-[var(--accent)] px-3 py-2 text-white">
                {t('settings.saveStorage')}
            </button>
            {mode === 'db' ? (
                <button
                    type="button"
                    className="rounded border border-[var(--border)] px-3 py-2"
                    onClick={() => void exportLedger(projectId).then(downloadYaml)}
                >
                    {t('settings.exportYaml')}
                </button>
            ) : null}
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </form>
    );
}
