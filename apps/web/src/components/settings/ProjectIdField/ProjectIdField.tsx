'use client';

import { useTranslation } from 'react-i18next';

import { CopyableCode } from '@/components/common/CopyableCode/CopyableCode';

export function ProjectIdField({ projectId }: { projectId: string }) {
    const { t } = useTranslation();

    return (
        <div className="grid gap-1">
            <label className="text-sm text-[var(--muted)]">{t('settings.projectIdForCli')}</label>
            <CopyableCode
                value={projectId}
                copyLabel={t('settings.copyProjectId')}
                copiedLabel={t('settings.projectIdCopied')}
            />
        </div>
    );
}
