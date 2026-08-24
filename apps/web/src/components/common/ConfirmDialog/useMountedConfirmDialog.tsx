'use client';

import { ConfirmDialog } from '@/components/common/ConfirmDialog/ConfirmDialog';
import { useConfirmDialog } from '@/components/common/ConfirmDialog/useConfirmDialog';

export function useMountedConfirmDialog(): {
    requestConfirm: ReturnType<typeof useConfirmDialog>['requestConfirm'];
    confirmDialog: React.ReactNode;
} {
    const { open, request, requestConfirm, onOpenChange } = useConfirmDialog();

    const confirmDialog = request ? (
        <ConfirmDialog
            open={open}
            title={request.title}
            description={request.description}
            confirmLabel={request.confirmLabel}
            cancelLabel={request.cancelLabel}
            variant={request.variant}
            onOpenChange={onOpenChange}
            onConfirm={request.onConfirm}
        />
    ) : null;

    return { requestConfirm, confirmDialog };
}
