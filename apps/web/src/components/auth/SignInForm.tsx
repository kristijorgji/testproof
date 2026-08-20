'use client';

import { useState } from 'react';

import { useT } from '../i18n/LocaleProvider';
import { authClient } from '@/lib/auth-client';

export function SignInForm({ nextPath }: { nextPath: string }) {
    const t = useT();
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

    return (
        <form className="grid gap-3" onSubmit={(event) => event.preventDefault()}>
            <h1 className="text-2xl font-semibold">{t('app.name')}</h1>
            <input
                className="rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
                type="text"
                name="name"
                autoComplete="name"
                placeholder={t('auth.name')}
                value={name}
                onChange={(event) => setName(event.target.value)}
            />
            <input
                className="rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
                type="email"
                name="email"
                autoComplete="email"
                placeholder={t('auth.email')}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
            />
            <input
                className="rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder={t('auth.password')}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
            />
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <div className="flex flex-wrap gap-2">
                <button type="button" className="rounded bg-[var(--accent)] px-3 py-2 text-white" onClick={() => void signInEmail()}>
                    {t('auth.signIn')}
                </button>
                <button type="button" className="rounded border border-[var(--border)] px-3 py-2" onClick={() => void signUpEmail()}>
                    {t('auth.signUp')}
                </button>
                <button type="button" className="rounded border border-[var(--border)] px-3 py-2" onClick={() => void signInGithub()}>
                    {t('auth.github')}
                </button>
            </div>
        </form>
    );
}
