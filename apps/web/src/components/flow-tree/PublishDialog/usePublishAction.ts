'use client';

import { type ReactNode, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import type { DraftActionResult, PublishResult, PublishStorage } from '@/actions/action-result';
import { useMountedConfirmDialog } from '@/components/common/ConfirmDialog/useMountedConfirmDialog';

const PUBLISH_ERROR_KEYS = [
    'prNotAllowed',
    'fileMissing',
    'fileNotWritable',
    'conflict',
    'publishFailed',
    'projectNotFound',
] as const;

export function usePublishAction({
    storage,
    ledgerFilePath,
    onPublish,
    onReplay,
    onDiscard,
}: {
    storage: PublishStorage;
    ledgerFilePath: string | null;
    onPublish: (input: { message: string; pullRequest: boolean }) => Promise<PublishResult>;
    onReplay: () => Promise<DraftActionResult>;
    onDiscard: () => Promise<DraftActionResult>;
}): {
    pending: boolean;
    formError: string | null;
    confirmDialog: ReactNode;
    requestPublish: (input: { message: string; pullRequest: boolean }) => void;
    replay: () => void;
    discard: () => void;
} {
    const { t } = useTranslation();
    const [pending, start] = useTransition();
    const [formError, setFormError] = useState<string | null>(null);
    const { requestConfirm, confirmDialog } = useMountedConfirmDialog();

    const translateError = (code: string): string => {
        if ((PUBLISH_ERROR_KEYS as readonly string[]).includes(code)) {
            return t(`editor.publishError.${code}`);
        }
        return code;
    };

    const requestPublish = (input: { message: string; pullRequest: boolean }): void => {
        const path = ledgerFilePath ?? '';
        const confirm =
            storage === 'file'
                ? { title: t('editor.confirmPublishFile'), description: t('editor.confirmPublishFileBody', { path }) }
                : storage === 'db'
                  ? { title: t('editor.confirmPublishDb'), description: t('editor.confirmPublishDbBody') }
                  : {
                        title: t('editor.confirmPublishGit'),
                        description: input.pullRequest
                            ? t('editor.confirmPublishGitPrBody')
                            : t('editor.confirmPublishGitBody'),
                    };

        requestConfirm({
            title: confirm.title,
            description: confirm.description,
            confirmLabel: t('editor.publish'),
            cancelLabel: t('common.cancel'),
            onConfirm: () => {
                start(async () => {
                    const result = await onPublish(input);
                    if (!result.ok) {
                        const message = translateError(result.error);
                        setFormError(message);
                        toast.error(message);
                        return;
                    }
                    setFormError(null);
                    if (result.storage === 'file') {
                        toast.success(t('editor.publishSuccessFile', { path: result.path }));
                        return;
                    }
                    if (result.storage === 'git') {
                        toast.success(
                            result.pullRequest ? t('editor.publishSuccessPr') : t('editor.publishSuccessGit'),
                        );
                        return;
                    }
                    toast.success(t('editor.publishSuccessDb'));
                });
            },
        });
    };

    const runDraftAction = (task: () => Promise<DraftActionResult>): void => {
        start(async () => {
            const result = await task();
            if (!result.ok) {
                const message = translateError(result.error);
                setFormError(message);
                toast.error(message);
            }
        });
    };

    return {
        pending,
        formError,
        confirmDialog,
        requestPublish,
        replay: () => runDraftAction(onReplay),
        discard: () => runDraftAction(onDiscard),
    };
}
