'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { authClient } from '@/lib/auth-client';

export function useSignInActions(nextPath: string): {
    email: string;
    setEmail: (value: string) => void;
    password: string;
    setPassword: (value: string) => void;
    name: string;
    setName: (value: string) => void;
    error: string | null;
    pending: boolean;
    signInEmail: () => Promise<void>;
    signUpEmail: () => Promise<void>;
    signInGithub: () => Promise<void>;
} {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);

    async function signInEmail(): Promise<void> {
        if (pending) return;
        setError(null);
        setPending(true);
        try {
            const result = await authClient.signIn.email({ email, password, callbackURL: nextPath });
            if (result.error) {
                setError(result.error.message ?? t('auth.failed'));
                setPending(false);
            }
        } catch {
            setError(t('auth.failed'));
            setPending(false);
        }
    }

    async function signUpEmail(): Promise<void> {
        if (pending) return;
        setError(null);
        setPending(true);
        try {
            const result = await authClient.signUp.email({
                email,
                password,
                name: name || email,
                callbackURL: nextPath,
            });
            if (result.error) {
                setError(result.error.message ?? t('auth.failed'));
                setPending(false);
            }
        } catch {
            setError(t('auth.failed'));
            setPending(false);
        }
    }

    async function signInGithub(): Promise<void> {
        if (pending) return;
        setError(null);
        setPending(true);
        try {
            await authClient.signIn.social({ provider: 'github', callbackURL: nextPath });
        } catch {
            setError(t('auth.failed'));
            setPending(false);
        }
    }

    return {
        email,
        setEmail,
        password,
        setPassword,
        name,
        setName,
        error,
        pending,
        signInEmail,
        signUpEmail,
        signInGithub,
    };
}
