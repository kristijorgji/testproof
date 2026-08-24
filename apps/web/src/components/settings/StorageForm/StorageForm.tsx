'use client';

import { useTranslation } from 'react-i18next';

import { StorageModeFields } from './StorageModeFields';
import { useStorageForm } from './useStorageForm';

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
    const { mode, setMode, error, pending, onSave, onExport, workingLabel } = useStorageForm(projectId, storage);

    return (
        <form
            className="grid gap-2"
            aria-busy={pending}
            onSubmit={(event) => {
                event.preventDefault();
                onSave(event.currentTarget);
            }}
        >
            <label className="text-sm">{t('settings.storage')}</label>
            <select
                name="storage"
                value={mode}
                disabled={pending}
                className="rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
                onChange={(event) => setMode(event.target.value)}
            >
                <option value="git">{t('settings.storageGit')}</option>
                <option value="file">{t('settings.storageFile')}</option>
                <option value="db">{t('settings.storageDb')}</option>
            </select>
            <StorageModeFields mode={mode} ledgerPath={ledgerPath} ledgerFilePath={ledgerFilePath} />
            <button
                type="submit"
                disabled={pending}
                className="rounded bg-[var(--accent)] px-3 py-2 text-white disabled:opacity-60"
            >
                {pending ? workingLabel : t('settings.saveStorage')}
            </button>
            {mode === 'db' ? (
                <button
                    type="button"
                    disabled={pending}
                    className="rounded border border-[var(--border)] px-3 py-2 disabled:opacity-60"
                    onClick={onExport}
                >
                    {pending ? workingLabel : t('settings.exportYaml')}
                </button>
            ) : null}
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </form>
    );
}
