'use client';

import { useTranslation } from 'react-i18next';

export function StorageModeFields({
    mode,
    ledgerPath,
    ledgerFilePath,
}: {
    mode: string;
    ledgerPath: string;
    ledgerFilePath: string | null;
}) {
    const { t } = useTranslation();
    return (
        <>
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
        </>
    );
}
