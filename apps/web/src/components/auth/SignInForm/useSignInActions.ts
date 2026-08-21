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
    signInEmail: () => Promise<void>;
    signUpEmail: () => Promise<void>;
    signInGithub: () => Promise<void>;
} {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState<string | null>(null);

    async function signInEmail(): Promise<void> {
        setError(null);
        const result = await authClient.signIn.email({ email, password, callbackURL: nextPath });
        if (result.error) setError(result.error.message ?? t('auth.failed'));
    }

    async function signUpEmail(): Promise<void> {
        setError(null);
        const result = await authClient.signUp.email({ email, password, name: name || email, callbackURL: nextPath });
        if (result.error) setError(result.error.message ?? t('auth.failed'));
    }

    async function signInGithub(): Promise<void> {
        setError(null);
        await authClient.signIn.social({ provider: 'github', callbackURL: nextPath });
    }

    return { email, setEmail, password, setPassword, name, setName, error, signInEmail, signUpEmail, signInGithub };
}
