'use client';

import { useTranslation } from 'react-i18next';

import { AuthTabs } from './AuthTabs';
import { SignInFields } from './SignInFields';
import { useSignInActions } from './useSignInActions';

import { FormAlert } from '@/components/common/FormAlert/FormAlert';

export function SignInForm({ nextPath }: { nextPath: string }) {
    const { t } = useTranslation();
    const {
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
    } = useSignInActions(nextPath);

    return (
        <form
            aria-busy={pending}
            className="grid gap-3"
            onSubmit={(event) => {
                event.preventDefault();
                void submit();
            }}
        >
            <h1 className="text-2xl font-semibold">{t('app.name')}</h1>
            <AuthTabs
                tab={tab}
                disabled={pending}
                onTabChange={(next) => {
                    setTab(next);
                }}
            />
            <SignInFields
                name={name}
                tab={tab}
                setName={setName}
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
                passwordError={passwordError ?? undefined}
                disabled={pending}
            />
            {error ? <FormAlert variant="error" message={error} /> : null}
            <div className="grid gap-2">
                <button
                    type="submit"
                    className="w-full rounded bg-[var(--accent)] px-3 py-2 text-white disabled:opacity-60"
                    disabled={pending}
                >
                    {pending ? t('auth.working') : tab === 'signUp' ? t('auth.signUp') : t('auth.signIn')}
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
