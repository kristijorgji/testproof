'use client';

import { useTranslation } from 'react-i18next';

import { SignInFields } from './SignInFields';
import { useSignInActions } from './useSignInActions';

export function SignInForm({ nextPath }: { nextPath: string }) {
    const { t } = useTranslation();
    const { email, setEmail, password, setPassword, name, setName, error, signInEmail, signUpEmail, signInGithub } =
        useSignInActions(nextPath);

    return (
        <form className="grid gap-3" onSubmit={(event) => event.preventDefault()}>
            <h1 className="text-2xl font-semibold">{t('app.name')}</h1>
            <SignInFields
                name={name}
                setName={setName}
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
            />
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    className="rounded bg-[var(--accent)] px-3 py-2 text-white"
                    onClick={() => void signInEmail()}
                >
                    {t('auth.signIn')}
                </button>
                <button
                    type="button"
                    className="rounded border border-[var(--border)] px-3 py-2"
                    onClick={() => void signUpEmail()}
                >
                    {t('auth.signUp')}
                </button>
                <button
                    type="button"
                    className="rounded border border-[var(--border)] px-3 py-2"
                    onClick={() => void signInGithub()}
                >
                    {t('auth.github')}
                </button>
            </div>
        </form>
    );
}
