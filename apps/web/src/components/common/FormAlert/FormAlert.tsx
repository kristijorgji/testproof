'use client';

export function FormAlert({ variant, title, message }: { variant: 'error' | 'info'; title?: string; message: string }) {
    const styles =
        variant === 'error'
            ? 'border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200'
            : 'border-[var(--border)] bg-[var(--card)] text-[var(--fg)]';

    return (
        <div className={`rounded border px-3 py-2 text-sm ${styles}`} role="alert" aria-live="polite">
            {title ? <p className="mb-1 font-medium">{title}</p> : null}
            <p>{message}</p>
        </div>
    );
}
