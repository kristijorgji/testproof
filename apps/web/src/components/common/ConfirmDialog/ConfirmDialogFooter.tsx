'use client';

function ConfirmDialogFooter({
    cancelRef,
    cancelLabel,
    confirmLabel,
    confirmDisabled,
    variant,
    onCancel,
    onConfirm,
}: {
    cancelRef: React.RefObject<HTMLButtonElement | null>;
    cancelLabel: string;
    confirmLabel: string;
    confirmDisabled?: boolean;
    variant: 'default' | 'destructive';
    onCancel: () => void;
    onConfirm: () => void;
}) {
    return (
        <div className="mt-4 flex justify-end gap-2">
            <button
                ref={cancelRef}
                type="button"
                className="rounded border border-[var(--border)] px-3 py-2 text-sm"
                onClick={onCancel}
            >
                {cancelLabel}
            </button>
            <button
                type="button"
                disabled={confirmDisabled}
                className={`rounded px-3 py-2 text-sm text-white disabled:opacity-60 ${
                    variant === 'destructive' ? 'bg-red-600 hover:bg-red-700' : 'bg-[var(--accent)]'
                }`}
                onClick={onConfirm}
            >
                {confirmLabel}
            </button>
        </div>
    );
}

export { ConfirmDialogFooter };
