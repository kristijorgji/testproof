'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { ProjectNav } from '@/components/layout/ProjectNav/ProjectNav';
import { isLedgerConfigErrorCode, type LedgerConfigErrorCode } from '@/lib/ledger-config-error';

export function LedgerConfigGateContent({
    projectId,
    name,
    code,
    path,
    causeMessage,
}: {
    projectId: string;
    name: string;
    code: LedgerConfigErrorCode;
    path?: string;
    causeMessage?: string;
}) {
    const { t } = useTranslation();
    const messageKey = isLedgerConfigErrorCode(code) ? `ledgerConfig.${code}` : 'ledgerConfig.invalidLedger';
    return (
        <>
            <ProjectNav name={name} projectId={projectId} />
            <main className="mx-auto max-w-lg p-6">
                <h1 className="mb-2 text-xl font-semibold">{t('ledgerConfig.title')}</h1>
                <p className="mb-4 text-[var(--muted)]">
                    {t(messageKey, { path: path ?? '', detail: causeMessage ?? '' })}
                </p>
                {path ? (
                    <p className="mb-4 font-mono text-sm text-[var(--muted)]">
                        {t('ledgerConfig.pathLabel', { path })}
                    </p>
                ) : null}
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
