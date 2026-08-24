'use client';

import { Eye, EyeOff } from 'lucide-react';
import { forwardRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface PasswordInputProps extends Omit<React.ComponentProps<'input'>, 'type'> {
    error?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(({ className, error, ...props }, ref) => {
    const { t } = useTranslation();
    const [visible, setVisible] = useState(false);

    return (
        <div className="grid gap-1">
            <div className="relative">
                <input
                    ref={ref}
                    type={visible ? 'text' : 'password'}
                    className={`w-full rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2 pr-10 disabled:opacity-60 ${className ?? ''}`}
                    {...props}
                />
                <button
                    type="button"
                    tabIndex={-1}
                    className="absolute right-0 top-0 flex h-full items-center px-3 text-[var(--muted)] hover:text-[var(--fg)]"
                    aria-label={visible ? t('auth.hidePassword') : t('auth.showPassword')}
                    onClick={() => setVisible((value) => !value)}
                >
                    {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
            </div>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>
    );
});

PasswordInput.displayName = 'PasswordInput';
