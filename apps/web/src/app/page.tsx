import Link from 'next/link';

import { LocaleSwitcher } from '@/components/i18n/LocaleSwitcher';
import { getLocaleFromCookie } from '@/i18n/get-locale';
import { getServerTranslation } from '@/i18n/server';

export default async function HomePage() {
    const { t } = await getServerTranslation(await getLocaleFromCookie());
    return (
        <main className="mx-auto max-w-2xl p-8">
            <div className="mb-6 flex justify-end">
                <LocaleSwitcher />
            </div>
            <h1 className="mb-2 text-3xl font-semibold">{t('app.name')}</h1>
            <p className="mb-6 text-[var(--muted)]">{t('home.tagline')}</p>
            <Link className="rounded bg-[var(--accent)] px-4 py-2 text-white" href="/projects">
                {t('home.openProjects')}
            </Link>
        </main>
    );
}
