'use client';

import { useTranslation } from 'react-i18next';

import type { ApiTokenListItem } from '@/actions/settings';

export function TokenListItem({
    row,
    busy,
    onRevoke,
    locale,
}: {
    row: ApiTokenListItem;
    busy: boolean;
    onRevoke: (tokenId: string) => void;
    locale: string;
}) {
    const { t } = useTranslation();

    return (
        <li className="flex items-start justify-between gap-3 rounded border border-[var(--border)] p-3 text-sm">
            <div>
                <strong>{row.name}</strong>
                <div className="text-[var(--muted)]">
                    {t('settings.tokenCreated')}: {new Date(row.createdAt).toLocaleString(locale)}
                </div>
                <div className="text-[var(--muted)]">
                    {t('settings.tokenLastUsed')}:{' '}
                    {row.lastUsedAt ? new Date(row.lastUsedAt).toLocaleString(locale) : '—'}
                </div>
            </div>
            <button
                type="button"
                disabled={busy}
                className="shrink-0 rounded border border-[var(--border)] px-2 py-1 text-sm disabled:opacity-60"
                onClick={() => onRevoke(row.id)}
            >
                {t('settings.revokeToken')}
            </button>
        </li>
    );
}
