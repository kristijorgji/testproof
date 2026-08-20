'use client';

import { useT } from '../i18n/LocaleProvider';

export function SessionFields() {
    const t = useT();
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
