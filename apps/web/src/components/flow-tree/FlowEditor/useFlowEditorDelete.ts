'use client';

import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import type { FlowEditorActions } from './useFlowEditorActions';

import { useMountedConfirmDialog } from '@/components/common/ConfirmDialog/useMountedConfirmDialog';

export function useFlowEditorDelete(actions: FlowEditorActions): {
    requestDeleteForFlow: (flowId: string) => void;
    confirmDialog: ReactNode;
} {
    const { t } = useTranslation();
    const { requestConfirm, confirmDialog } = useMountedConfirmDialog();
    return {
        confirmDialog,
        requestDeleteForFlow: (flowId: string) => {
            const confirm = actions.getRemoveConfirmFor(flowId);
            if (!confirm) return;
            requestConfirm({
                title: confirm.title,
                description: confirm.description,
                confirmLabel: t('common.delete'),
                cancelLabel: t('common.cancel'),
                variant: 'destructive',
                onConfirm: () => actions.removeFlow(flowId),
            });
        },
    };
}
