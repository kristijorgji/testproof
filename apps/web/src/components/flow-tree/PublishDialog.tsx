'use client';

import { useState } from 'react';

import { useT } from '../i18n/LocaleProvider';

export function PublishDialog({
    conflict,
    onPublish,
    onReplay,
    onDiscard,
}: {
    conflict?: { remote: string; draft: string };
    onPublish?: (input: { message: string; pullRequest: boolean }) => void;
    onReplay?: () => void;
    onDiscard?: () => void;
}) {
    const t = useT();
    const [message, setMessage] = useState('chore: update flows ledger');
    const [pullRequest, setPullRequest] = useState(true);

    if (conflict) {
        return (
            <div className="rounded border border-red-400 p-4">
                <h2 className="mb-2 font-semibold">{t('conflict.title')}</h2>
                <div className="grid gap-2 md:grid-cols-2">
                    <pre className="max-h-64 overflow-auto text-xs">{conflict.remote}</pre>
                    <pre className="max-h-64 overflow-auto text-xs">{conflict.draft}</pre>
                </div>
                <div className="mt-3 flex gap-2">
                    <button type="button" className="rounded bg-[var(--accent)] px-3 py-1 text-white" onClick={onReplay}>
                        {t('conflict.replay')}
                    </button>
                    <button type="button" className="rounded border px-3 py-1" onClick={onDiscard}>
                        {t('conflict.discard')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <form
            className="flex flex-col gap-3 rounded border border-[var(--border)] p-4"
            onSubmit={(e) => {
                e.preventDefault();
                onPublish?.({ message, pullRequest });
            }}
        >
            <input
                className="rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />
            <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={pullRequest} onChange={(e) => setPullRequest(e.target.checked)} />
                Open pull request
            </label>
            <button type="submit" className="rounded bg-[var(--accent)] px-3 py-2 text-white">
                {t('editor.publish')}
            </button>
        </form>
    );
}
