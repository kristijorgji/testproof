'use client';

import Link from 'next/link';

import { SignOutButton } from '../auth/SignOutButton';
import { useT } from '../i18n/LocaleProvider';

export function ProjectNav({ projectId, name }: { projectId: string; name: string }) {
    const t = useT();
    const links = [
        ['nav.flows', 'flows'],
        ['nav.coverage', 'coverage'],
        ['nav.runs', 'runs'],
        ['nav.sessions', 'sessions'],
        ['nav.settings', 'settings'],
    ] as const;
    return (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
            <div className="flex flex-wrap items-center gap-3">
                <Link href="/projects" className="font-semibold">
                    {t('app.name')}
                </Link>
                <span className="text-[var(--muted)]">{name}</span>
                {links.map(([key, href]) => (
                    <Link key={href} className="text-sm" href={`/projects/${projectId}/${href}`}>
                        {t(key)}
                    </Link>
                ))}
            </div>
            <SignOutButton />
        </header>
    );
}
