'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { SignOutButton } from '@/components/auth/SignOutButton/SignOutButton';
import { LocaleSwitcher } from '@/components/i18n/LocaleSwitcher/LocaleSwitcher';
import { ThemeToggle } from '@/components/theme/ThemeToggle/ThemeToggle';
import { TESTPROOF_GITHUB_ISSUES_URL, TESTPROOF_GITHUB_URL, TESTPROOF_VERSION } from '@/lib/app-version';

export function AboutPageContent() {
    const { t } = useTranslation();
    return (
        <main className="mx-auto max-w-2xl p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                    <Link href="/projects" className="font-semibold">
                        {t('app.name')}
                    </Link>
                    <span className="text-sm text-[var(--muted)]">{t('nav.about')}</span>
                </div>
                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <LocaleSwitcher />
                    <SignOutButton />
                </div>
            </div>
            <h1 className="mb-2 text-2xl font-semibold">{t('about.title')}</h1>
            <p className="mb-4 text-[var(--muted)]">{t('about.blurb')}</p>
            <dl className="mb-6 grid gap-3 text-sm">
                <div>
                    <dt className="text-[var(--muted)]">{t('about.version')}</dt>
                    <dd>
                        <code>{TESTPROOF_VERSION}</code>
                    </dd>
                </div>
                <div>
                    <dt className="text-[var(--muted)]">{t('about.source')}</dt>
                    <dd>
                        <a href={TESTPROOF_GITHUB_URL} className="underline" target="_blank" rel="noreferrer">
                            {TESTPROOF_GITHUB_URL.replace('https://', '')}
                        </a>
                    </dd>
                </div>
            </dl>
            <p className="text-sm text-[var(--muted)]">
                {t('about.issuesLead')}{' '}
                <a href={TESTPROOF_GITHUB_ISSUES_URL} className="underline" target="_blank" rel="noreferrer">
                    {t('about.issuesLink')}
                </a>
                {t('about.issuesTrail')}
            </p>
        </main>
    );
}
