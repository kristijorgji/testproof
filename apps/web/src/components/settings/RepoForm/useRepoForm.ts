'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function useRepoForm(saveAction: (formData: FormData) => void | Promise<void>): {
    error: string | null;
    pending: boolean;
    workingLabel: string;
    onSubmit: (form: HTMLFormElement) => void;
} {
    const { t } = useTranslation();
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);

    return {
        error,
        pending,
        workingLabel: t('common.working'),
        onSubmit: (form) => {
            if (pending) return;
            setError(null);
            setPending(true);
            const formData = new FormData(form);
            void Promise.resolve(saveAction(formData))
                .catch((caught: unknown) => {
                    setError(caught instanceof Error ? caught.message : String(caught));
                })
                .finally(() => {
                    setPending(false);
                });
        },
    };
}
