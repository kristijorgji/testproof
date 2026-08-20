'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { createApiToken } from '@/actions/settings';

export function TokenForm({ projectId }: { projectId: string }) {
    const { t } = useTranslation();
    const [token, setToken] = useState<string | null>(null);

    return (
        <form
            className="grid gap-2"
            onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                void createApiToken(projectId, form).then((result) => setToken(result.token));
            }}
        >
            <input
                name="name"
                placeholder={t('settings.tokenName')}
                className="rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
            />
            <button type="submit" className="rounded bg-[var(--accent)] px-3 py-2 text-white">
                {t('settings.createToken')}
            </button>
            {token ? (
                <p className="text-sm">
                    {t('settings.tokenOnce')} <code className="break-all">{token}</code>
                </p>
            ) : null}
        </form>
    );
}
