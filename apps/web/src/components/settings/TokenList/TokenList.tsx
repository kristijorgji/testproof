'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useTranslation } from 'react-i18next';

import type { ApiTokenListItem } from '@/actions/settings';

export function TokenList({
    tokens,
    pending,
    deleteAction,
}: {
    tokens: ApiTokenListItem[];
    pending: boolean;
    deleteAction: (tokenId: string) => void | Promise<void>;
}) {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const [deleting, startDelete] = useTransition();
    const busy = pending || deleting;

    if (tokens.length === 0) {
        return <p className="text-sm text-[var(--muted)]">{t('settings.tokensEmpty')}</p>;
    }

    return (
        <ul className="grid gap-2">
            {tokens.map((row) => (
                <li
                    key={row.id}
                    className="flex items-start justify-between gap-3 rounded border border-[var(--border)] p-3 text-sm"
                >
                    <div>
                        <strong>{row.name}</strong>
                        <div className="text-[var(--muted)]">
                            {t('settings.tokenCreated')}: {new Date(row.createdAt).toLocaleString(i18n.language)}
                        </div>
                        <div className="text-[var(--muted)]">
                            {t('settings.tokenLastUsed')}:{' '}
                            {row.lastUsedAt ? new Date(row.lastUsedAt).toLocaleString(i18n.language) : '—'}
                        </div>
                    </div>
                    <button
                        type="button"
                        disabled={busy}
                        className="shrink-0 rounded border border-[var(--border)] px-2 py-1 text-sm disabled:opacity-60"
                        onClick={() => {
                            if (busy) return;
                            if (!window.confirm(t('settings.confirmRevokeToken'))) return;
                            startDelete(async () => {
                                await deleteAction(row.id);
                                router.refresh();
                            });
                        }}
                    >
                        {t('settings.revokeToken')}
                    </button>
                </li>
            ))}
        </ul>
    );
}
