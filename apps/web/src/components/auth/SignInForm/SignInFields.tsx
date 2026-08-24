'use client';

import { useTranslation } from 'react-i18next';

import type { AuthTab } from './auth-tab';
import { SignUpNameField } from './SignUpNameField';

import { PasswordInput } from '@/components/common/inputs/PasswordInput/PasswordInput';

const inputClass = 'w-full rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2 disabled:opacity-60';

export function SignInFields({
    tab,
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    passwordError,
    disabled,
}: {
    tab: AuthTab;
    name: string;
    setName: (v: string) => void;
    email: string;
    setEmail: (v: string) => void;
    password: string;
    setPassword: (v: string) => void;
    confirmPassword: string;
    setConfirmPassword: (v: string) => void;
    passwordError?: string;
    disabled?: boolean;
}) {
    const { t } = useTranslation();
    const isSignUp = tab === 'signUp';

    return (
        <>
            {isSignUp ? <SignUpNameField name={name} setName={setName} disabled={disabled} /> : null}
            <input
                name="email"
                className={inputClass}
                type="email"
                autoComplete="email"
                placeholder={t('auth.email')}
                value={email}
                required
                disabled={disabled}
                onChange={(e) => setEmail(e.target.value)}
            />
            <PasswordInput
                name="password"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                placeholder={t('auth.password')}
                value={password}
                required
                disabled={disabled}
                onChange={(e) => setPassword(e.target.value)}
            />
            {isSignUp ? (
                <PasswordInput
                    name="confirmPassword"
                    autoComplete="new-password"
                    placeholder={t('auth.confirmPassword')}
                    value={confirmPassword}
                    required
                    disabled={disabled}
                    error={passwordError}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
            ) : null}
        </>
    );
}
