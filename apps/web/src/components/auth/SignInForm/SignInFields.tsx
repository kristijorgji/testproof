'use client';

import { useTranslation } from 'react-i18next';

export function SignInFields({
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
}: {
    name: string;
    setName: (value: string) => void;
    email: string;
    setEmail: (value: string) => void;
    password: string;
    setPassword: (value: string) => void;
}) {
    const { t } = useTranslation();
    return (
        <>
            <input
                name="name"
                className="rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
                type="text"
                autoComplete="name"
                placeholder={t('auth.name')}
                value={name}
                onChange={(event) => setName(event.target.value)}
            />
            <input
                name="email"
                className="rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
                type="email"
                autoComplete="email"
                placeholder={t('auth.email')}
                value={email}
                required
                onChange={(event) => setEmail(event.target.value)}
            />
            <input
                name="password"
                className="rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
                type="password"
                autoComplete="current-password"
                placeholder={t('auth.password')}
                value={password}
                required
                onChange={(event) => setPassword(event.target.value)}
            />
        </>
    );
}
