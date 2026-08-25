'use client';

import { useTranslation } from 'react-i18next';

export function PublishConflictPanel({
    conflict,
    pending,
    onReplay,
    onDiscard,
}: {
    conflict: { remote: string; draft: string };
    pending: boolean;
    onReplay: () => void;
    onDiscard: () => void;
}) {
    const { t } = useTranslation();
    return (
        <div className="rounded border border-red-400 p-4">
            <h2 className="mb-2 font-semibold">{t('conflict.title')}</h2>
            <div className="grid gap-2 md:grid-cols-2">
                <pre className="max-h-64 overflow-auto text-xs">{conflict.remote}</pre>
                <pre className="max-h-64 overflow-auto text-xs">{conflict.draft}</pre>
            </div>
            <div className="mt-3 flex gap-2">
                <button
                    type="button"
                    className="rounded bg-[var(--accent)] px-3 py-1 text-white"
                    disabled={pending}
                    onClick={onReplay}
                >
                    {t('conflict.replay')}
                </button>
                <button type="button" className="rounded border px-3 py-1" disabled={pending} onClick={onDiscard}>
                    {t('conflict.discard')}
                </button>
            </div>
        </div>
    );
}
