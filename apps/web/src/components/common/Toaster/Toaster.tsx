'use client';

import { Toaster as SonnerToaster } from 'sonner';

import { useTheme } from '@/components/theme/ThemeProvider/useTheme';

export function Toaster() {
    const { resolvedTheme } = useTheme();

    return (
        <SonnerToaster
            theme={resolvedTheme}
            toastOptions={{
                classNames: {
                    toast: 'border border-[var(--border)] bg-[var(--card)] text-[var(--fg)]',
                    title: 'text-[var(--fg)]',
                    description: 'text-[var(--muted)]',
                },
            }}
        />
    );
}
