'use client';

import { useT } from '../i18n/LocaleProvider';
import { authClient } from '@/lib/auth-client';

export function SignOutButton() {
    const t = useT();
    return (
        <button
            type="button"
            className="text-sm text-[var(--muted)]"
            onClick={() => {
                void authClient.signOut({ fetchOptions: { onSuccess: () => {
                    window.location.href = '/sign-in';
                } } });
            }}
        >
            {t('auth.signOut')}
        </button>
    );
}
