'use client';

import { useTranslation } from 'react-i18next';

import { authClient } from '@/lib/auth-client';

export function SignOutButton() {
    const { t } = useTranslation();
    return (
        <button
            type="button"
            className="text-sm text-[var(--muted)]"
            onClick={() => {
                void authClient.signOut({
                    fetchOptions: {
                        onSuccess: () => {
                            window.location.href = '/sign-in';
                        },
                    },
                });
            }}
        >
            {t('auth.signOut')}
        </button>
    );
}
