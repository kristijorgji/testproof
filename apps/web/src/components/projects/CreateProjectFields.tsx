'use client';

import { useTranslation } from 'react-i18next';

export function CreateProjectFields() {
    const { t } = useTranslation();
    return (
        <>
            <input
                name="name"
                required
                placeholder={t('projects.name')}
                className="rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
            />
            <input
                name="slug"
                required
                placeholder={t('projects.slug')}
                className="rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
            />
        </>
    );
}
