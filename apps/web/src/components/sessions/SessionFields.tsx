'use client';

import { useTranslation } from 'react-i18next';

export function SessionFields() {
    const { t } = useTranslation();
    return (
        <>
            <input
                name="title"
                required
                placeholder={t('sessions.titleField')}
                className="rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
            />
            <textarea
                name="notes"
                placeholder={t('sessions.notes')}
                className="rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
            />
        </>
    );
}
