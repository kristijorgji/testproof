'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useTranslation } from 'react-i18next';

import { useMountedConfirmDialog } from '@/components/common/ConfirmDialog/useMountedConfirmDialog';

export function useProjectDeleteAction(
    deleteAction: (projectId: string) => void | Promise<void>,
    onDeleted?: () => void,
): {
    deleting: boolean;
    requestDelete: (projectId: string) => void;
    confirmDialog: React.ReactNode;
} {
    const { t } = useTranslation();
    const router = useRouter();
    const [deleting, startDelete] = useTransition();
    const { requestConfirm, confirmDialog } = useMountedConfirmDialog();

    const requestDelete = (projectId: string): void => {
        requestConfirm({
            title: t('projects.confirmDelete'),
            confirmLabel: t('common.delete'),
            cancelLabel: t('common.cancel'),
            variant: 'destructive',
            onConfirm: () => {
                startDelete(async () => {
                    await deleteAction(projectId);
                    if (onDeleted) onDeleted();
                    else router.refresh();
                });
            },
        });
    };

    return { deleting, requestDelete, confirmDialog };
}
