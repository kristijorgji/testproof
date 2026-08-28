'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { AuthTab } from './auth-tab';
import { resolveAuthRedirectTarget } from './resolve-auth-redirect';
import { mapGithubError, type SignInActions } from './sign-in-actions-types';

import { authClient } from '@/lib/auth-client';
import { readPreferredProjectId, resolveAuthLandingPath } from '@/lib/preferred-project';

export function useSignInActions(nextPath: string): SignInActions {
    const { t } = useTranslation();
    const [tab, setTab] = useState<AuthTab>('signIn');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);

    async function signInEmail(): Promise<void> {
        if (pending) return;
        setError(null);
        setPasswordError(null);
        setPending(true);
        try {
            const callbackURL = resolveAuthLandingPath(nextPath, readPreferredProjectId());
            const result = await authClient.signIn.email({ email, password, callbackURL });
            const target = resolveAuthRedirectTarget(result, callbackURL);
            if (!target) {
                setError(result.error?.message ?? t('auth.failed'));
                setPending(false);
                return;
            }
            window.location.assign(target);
        } catch {
            setError(t('auth.networkError'));
            setPending(false);
        }
    }

    async function signUpEmail(): Promise<void> {
        if (pending) return;
        setError(null);
        setPasswordError(null);
        if (password !== confirmPassword) {
            setPasswordError(t('auth.passwordMismatch'));
            return;
        }
        setPending(true);
        try {
            const callbackURL = resolveAuthLandingPath(nextPath, readPreferredProjectId());
            const result = await authClient.signUp.email({
                email,
                password,
                name: name || email,
                callbackURL,
            });
            const target = resolveAuthRedirectTarget(result, callbackURL);
            if (!target) {
                setError(result.error?.message ?? t('auth.signUpFailed'));
                setPending(false);
                return;
            }
            window.location.assign(target);
        } catch {
            setError(t('auth.networkError'));
            setPending(false);
        }
    }

    async function submit(): Promise<void> {
        if (tab === 'signUp') await signUpEmail();
        else await signInEmail();
    }

    async function signInGithub(): Promise<void> {
        if (pending) return;
        setError(null);
        setPasswordError(null);
        setPending(true);
        try {
            const callbackURL = resolveAuthLandingPath(nextPath, readPreferredProjectId());
            const result = await authClient.signIn.social({ provider: 'github', callbackURL });
            if (result.error) {
                setError(mapGithubError(result.error.message, t));
                setPending(false);
                return;
            }
            if (result.data?.url) {
                window.location.assign(result.data.url);
                return;
            }
            setError(t('auth.githubFailed'));
            setPending(false);
        } catch {
            setError(t('auth.networkError'));
            setPending(false);
        }
    }

    return {
        tab,
        setTab,
        email,
        setEmail,
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        name,
        setName,
        error,
        passwordError,
        pending,
        submit,
        signInGithub,
    };
}
