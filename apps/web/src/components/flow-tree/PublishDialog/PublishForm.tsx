'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { PublishFormActions } from './PublishFormActions';

import type { PublishStorage } from '@/actions/action-result';
import { FormAlert } from '@/components/common/FormAlert/FormAlert';

export function PublishForm({
    storage,
    pending,
    formError,
    dirty,
    onPublish,
    onDiscard,
}: {
    storage: PublishStorage;
    pending: boolean;
    formError: string | null;
    dirty: boolean;
    onPublish: (input: { message: string; pullRequest: boolean }) => void;
    onDiscard: () => void;
}) {
    const { t } = useTranslation();
    const [message, setMessage] = useState('chore: update flows ledger');
    const [pullRequest, setPullRequest] = useState(false);
    const canPullRequest = storage === 'git';

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
            <PublishFormActions storage={storage} pending={pending} dirty={dirty} onDiscard={onDiscard} />
        </form>
    );
}
