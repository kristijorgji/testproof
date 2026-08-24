'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function ProjectIdField({ projectId }: { projectId: string }) {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);

    return (
        <div className="grid gap-1">
            <label className="text-sm text-[var(--muted)]">{t('settings.projectIdForCli')}</label>
            <div className="flex flex-wrap items-center gap-2">
                <code className="break-all rounded border border-[var(--border)] bg-[var(--bg)] px-2 py-1 text-xs">
                    {projectId}
                </code>
                <button
                    type="button"
                    className="rounded border border-[var(--border)] px-2 py-1 text-sm"
                    onClick={() => {
                        void navigator.clipboard.writeText(projectId).then(() => {
                            setCopied(true);
                            window.setTimeout(() => setCopied(false), 2000);
                        });
                    }}
                >
                    {copied ? t('settings.projectIdCopied') : t('settings.copyProjectId')}
                </button>
            </div>
        </div>
    );
}
