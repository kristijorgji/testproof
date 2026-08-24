'use client';

import { useTranslation } from 'react-i18next';

import type { AuthTab } from './auth-tab';

export function AuthTabs({
    tab,
    onTabChange,
    disabled,
}: {
    tab: AuthTab;
    onTabChange: (tab: AuthTab) => void;
    disabled?: boolean;
}) {
    const { t } = useTranslation();
    const base = 'flex-1 rounded px-3 py-2 text-sm';
    const active = 'bg-[var(--accent)] text-white';
    const inactive = 'border border-[var(--border)]';

    return (
        <div className="grid grid-cols-2 gap-2" role="tablist">
            <button
                type="button"
                role="tab"
                aria-selected={tab === 'signIn'}
                disabled={disabled}
                className={`${base} ${tab === 'signIn' ? active : inactive} disabled:opacity-60`}
                onClick={() => onTabChange('signIn')}
            >
                {t('auth.signInTab')}
            </button>
            <button
                type="button"
                role="tab"
                aria-selected={tab === 'signUp'}
                disabled={disabled}
                className={`${base} ${tab === 'signUp' ? active : inactive} disabled:opacity-60`}
                onClick={() => onTabChange('signUp')}
            >
                {t('auth.signUpTab')}
            </button>
        </div>
    );
}
