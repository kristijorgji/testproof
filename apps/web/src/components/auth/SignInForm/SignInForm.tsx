'use client';

import { useTranslation } from 'react-i18next';

import { SignInFields } from './SignInFields';
import { useSignInActions } from './useSignInActions';

export function SignInForm({ nextPath }: { nextPath: string }) {
    const { t } = useTranslation();
    const {
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
    } = useSignInActions(nextPath);

    return (
        <form aria-busy={pending} className="grid gap-3" onSubmit={(event) => event.preventDefault()}>
            <h1 className="text-2xl font-semibold">{t('app.name')}</h1>
            <SignInFields
                name={name}
                setName={setName}
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                disabled={pending}
            />
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <div className="grid gap-2">
                <button
                    type="button"
                    className="w-full rounded bg-[var(--accent)] px-3 py-2 text-white disabled:opacity-60"
                    disabled={pending}
                    onClick={() => void signInEmail()}
                >
                    {pending ? t('auth.working') : t('auth.signIn')}
                </button>
                <button
                    type="button"
                    className="w-full rounded border border-[var(--border)] px-3 py-2 disabled:opacity-60"
                    disabled={pending}
                    onClick={() => void signUpEmail()}
                >
                    {pending ? t('auth.working') : t('auth.signUp')}
                </button>
                <button
                    type="button"
                    className="w-full rounded border border-[var(--border)] px-3 py-2 disabled:opacity-60"
                    disabled={pending}
                    onClick={() => void signInGithub()}
                >
                    {pending ? t('auth.working') : t('auth.github')}
                </button>
            </div>
        </form>
    );
}
