'use client';

import { useTranslation } from 'react-i18next';

import type { SessionListItem } from './SessionsPageContent';

export function SessionList({
    sessions,
    pending,
    onDelete,
}: {
    sessions: SessionListItem[];
    pending: boolean;
    onDelete: (sessionId: string) => void;
}) {
    const { t, i18n } = useTranslation();
    if (sessions.length === 0) {
        return <p className="text-[var(--muted)]">{t('sessions.empty')}</p>;
    }
    return (
        <ul className="grid gap-2">
            {sessions.map((row) => (
                <li key={row.id} className="rounded border border-[var(--border)] p-3">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <strong>{row.title}</strong>
                            <div className="text-sm text-[var(--muted)]">
                                {row.performedAt.toLocaleString(i18n.language)}
                            </div>
                            {row.notes ? <p>{row.notes}</p> : null}
                        </div>
                        <button
                            type="button"
                            disabled={pending}
                            className="shrink-0 rounded border border-[var(--border)] px-2 py-1 text-sm disabled:opacity-60"
                            onClick={() => onDelete(row.id)}
                        >
                            {t('sessions.delete')}
                        </button>
                    </div>
                </li>
            ))}
        </ul>
    );
}
