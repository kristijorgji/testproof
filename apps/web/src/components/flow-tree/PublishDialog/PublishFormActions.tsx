'use client';

import { useTranslation } from 'react-i18next';

import type { PublishStorage } from '@/actions/action-result';

function publishLabel(storage: PublishStorage, t: (key: string) => string): string {
    if (storage === 'file') return t('editor.publishToFile');
    if (storage === 'db') return t('editor.publishToDb');
    return t('editor.publish');
}

export function PublishFormActions({
    storage,
    pending,
    dirty,
    onDiscard,
}: {
    storage: PublishStorage;
    pending: boolean;
    dirty: boolean;
    onDiscard: () => void;
}) {
    const { t } = useTranslation();
    const discardLabel = storage === 'file' ? t('editor.reloadFromFile') : t('editor.discardChanges');

    return (
        <div className="flex flex-wrap gap-2">
            <button
                type="submit"
                disabled={pending}
                className="rounded bg-[var(--accent)] px-3 py-2 text-white disabled:opacity-60"
            >
                {pending ? t('common.working') : publishLabel(storage, t)}
            </button>
            {dirty ? (
                <button
                    type="button"
                    disabled={pending}
                    className="rounded border border-[var(--border)] px-3 py-2 disabled:opacity-60"
                    onClick={onDiscard}
                >
                    {pending ? t('common.working') : discardLabel}
                </button>
            ) : null}
        </div>
    );
}
