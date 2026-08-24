'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { downloadYaml } from './downloadYaml';

import { exportLedger, saveStorage } from '@/actions/storage';

export function useStorageForm(
    projectId: string,
    storage: string,
): {
    mode: string;
    setMode: (value: string) => void;
    error: string | null;
    pending: boolean;
    onSave: (form: HTMLFormElement) => void;
    onExport: () => void;
    workingLabel: string;
} {
    const { t } = useTranslation();
    const [mode, setMode] = useState(storage);
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);

    function run(task: () => Promise<void>): void {
        if (pending) return;
        setError(null);
        setPending(true);
        void task()
            .catch((caught: unknown) => {
                setError(caught instanceof Error ? caught.message : String(caught));
            })
            .finally(() => {
                setPending(false);
            });
    }

    return {
        mode,
        setMode,
        error,
        pending,
        workingLabel: t('common.working'),
        onSave: (form) => {
            const formData = new FormData(form);
            run(async () => {
                await saveStorage(projectId, formData);
            });
        },
        onExport: () => {
            run(async () => {
                downloadYaml(await exportLedger(projectId));
            });
        },
    };
}
