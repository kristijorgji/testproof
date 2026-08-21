'use client';

import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { authClient } from '@/lib/auth-client';

export function SignOutButton() {
    const { t } = useTranslation();
    const router = useRouter();
    return (
        <button
            type="button"
            className="text-sm text-[var(--muted)]"
            onClick={() => {
                void authClient.signOut({
                    fetchOptions: {
                        onSuccess: () => {
                            router.push('/sign-in');
                            router.refresh();
                        },
                    },
                });
            }}
        >
            {t('auth.signOut')}
        </button>
    );
}
