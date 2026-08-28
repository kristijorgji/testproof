'use client';

import { PublishConflictPanel } from './PublishConflictPanel';
import { PublishForm } from './PublishForm';

import type { PublishStorage } from '@/actions/action-result';

export function PublishDialog({
    storage,
    conflict,
    pending,
    formError,
    dirty,
    onPublish,
    onReplay,
    onDiscard,
}: {
    storage: PublishStorage;
    conflict?: { remote: string; draft: string };
    pending: boolean;
    formError: string | null;
    dirty: boolean;
    onPublish: (input: { message: string; pullRequest: boolean }) => void;
    onReplay: () => void;
    onDiscard: () => void;
}) {
    if (conflict) {
        return <PublishConflictPanel conflict={conflict} pending={pending} onReplay={onReplay} onDiscard={onDiscard} />;
    }

    return (
        <PublishForm
            storage={storage}
            pending={pending}
            formError={formError}
            dirty={dirty}
            onPublish={onPublish}
            onDiscard={onDiscard}
        />
    );
}
