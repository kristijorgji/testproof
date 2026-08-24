'use client';

import { useCallback, useState } from 'react';

export interface ConfirmRequest {
    title: string;
    description?: string;
    confirmLabel: string;
    cancelLabel: string;
    variant?: 'default' | 'destructive';
    onConfirm: () => void;
}

export function useConfirmDialog(): {
    open: boolean;
    request: ConfirmRequest | null;
    requestConfirm: (request: ConfirmRequest) => void;
    onOpenChange: (open: boolean) => void;
} {
    const [open, setOpen] = useState(false);
    const [request, setRequest] = useState<ConfirmRequest | null>(null);

    const requestConfirm = useCallback((next: ConfirmRequest) => {
        setRequest(next);
        setOpen(true);
    }, []);

    const onOpenChange = useCallback((next: boolean) => {
        setOpen(next);
        if (!next) setRequest(null);
    }, []);

    return { open, request, requestConfirm, onOpenChange };
}
