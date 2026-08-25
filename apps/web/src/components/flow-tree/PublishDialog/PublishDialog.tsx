'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { PublishConflictPanel } from './PublishConflictPanel';

import type { PublishStorage } from '@/actions/action-result';
import { FormAlert } from '@/components/common/FormAlert/FormAlert';

export function PublishDialog({
    storage,
    conflict,
    pending,
    formError,
    onPublish,
    onReplay,
    onDiscard,
}: {
    storage: PublishStorage;
    conflict?: { remote: string; draft: string };
    pending: boolean;
    formError: string | null;
    onPublish: (input: { message: string; pullRequest: boolean }) => void;
    onReplay: () => void;
    onDiscard: () => void;
}) {
    const { t } = useTranslation();
    const [message, setMessage] = useState('chore: update flows ledger');
    const [pullRequest, setPullRequest] = useState(false);
    const canPullRequest = storage === 'git';
    const submitLabel =
        storage === 'file'
            ? t('editor.publishToFile')
            : storage === 'db'
              ? t('editor.publishToDb')
              : t('editor.publish');

    if (conflict) {
        return <PublishConflictPanel conflict={conflict} pending={pending} onReplay={onReplay} onDiscard={onDiscard} />;
    }

    return (
        <form
            className="flex flex-col gap-3 rounded border border-[var(--border)] p-4"
            onSubmit={(event) => {
                event.preventDefault();
                onPublish({
                    message: canPullRequest ? message : 'chore: update flows ledger',
                    pullRequest: canPullRequest ? pullRequest : false,
                });
            }}
        >
            {canPullRequest ? (
                <>
                    <input
                        className="rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                    />
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={pullRequest}
                            onChange={(event) => setPullRequest(event.target.checked)}
                        />
                        {t('editor.pullRequest')}
                    </label>
                </>
            ) : null}
            {formError ? <FormAlert variant="error" message={formError} /> : null}
            <button
                type="submit"
                disabled={pending}
                className="rounded bg-[var(--accent)] px-3 py-2 text-white disabled:opacity-60"
            >
                {pending ? t('common.working') : submitLabel}
            </button>
        </form>
    );
}
