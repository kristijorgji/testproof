'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { ProjectNav } from '@/components/layout/ProjectNav/ProjectNav';

export function LedgerConfigGateContent({
    projectId,
    name,
    message,
}: {
    projectId: string;
    name: string;
    message: string;
}) {
    const { t } = useTranslation();
    return (
        <>
            <ProjectNav name={name} projectId={projectId} />
            <main className="mx-auto max-w-lg p-6">
                <h1 className="mb-2 text-xl font-semibold">{t('ledgerConfig.title')}</h1>
                <p className="mb-4 text-[var(--muted)]">{message}</p>
                <Link
                    className="inline-block rounded bg-[var(--accent)] px-4 py-2 text-white"
                    href={`/projects/${projectId}/settings`}
                >
                    {t('ledgerConfig.openSettings')}
                </Link>
            </main>
        </>
    );
}
