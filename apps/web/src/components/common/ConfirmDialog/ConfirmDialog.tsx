'use client';

import { useEffect, useId, useRef } from 'react';

import { ConfirmDialogFooter } from './ConfirmDialogFooter';

export interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    confirmLabel: string;
    cancelLabel: string;
    onConfirm: () => void;
    variant?: 'default' | 'destructive';
    confirmDisabled?: boolean;
}

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel,
    cancelLabel,
    onConfirm,
    variant = 'default',
    confirmDisabled,
}: ConfirmDialogProps) {
    const titleId = useId();
    const descriptionId = useId();
    const cancelRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!open) return;
        cancelRef.current?.focus();
        const onKeyDown = (event: KeyboardEvent): void => {
            if (event.key === 'Escape') onOpenChange(false);
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [open, onOpenChange]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
                type="button"
                className="absolute inset-0 bg-black/40"
                aria-label={cancelLabel}
                onClick={() => onOpenChange(false)}
            />
            <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={description ? descriptionId : undefined}
                className="relative z-10 w-full max-w-md rounded border border-[var(--border)] bg-[var(--card)] p-4 shadow-lg"
            >
                <h2 id={titleId} className="text-lg font-semibold">
                    {title}
                </h2>
                {description ? (
                    <p id={descriptionId} className="mt-2 text-sm text-[var(--muted)]">
                        {description}
                    </p>
                ) : null}
                <ConfirmDialogFooter
                    cancelRef={cancelRef}
                    cancelLabel={cancelLabel}
                    confirmLabel={confirmLabel}
                    confirmDisabled={confirmDisabled}
                    variant={variant}
                    onCancel={() => onOpenChange(false)}
                    onConfirm={() => {
                        onConfirm();
                        onOpenChange(false);
                    }}
                />
            </div>
        </div>
    );
}
