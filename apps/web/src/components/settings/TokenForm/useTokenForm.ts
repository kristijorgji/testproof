'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { createApiToken } from '@/actions/settings';

export function useTokenForm(projectId: string): {
    plaintext: string | null;
    error: string | null;
    pending: boolean;
    workingLabel: string;
    onSubmit: (form: HTMLFormElement) => void;
} {
    const { t } = useTranslation();
    const router = useRouter();
    const [plaintext, setPlaintext] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);

    return {
        plaintext,
        error,
        pending,
        workingLabel: t('common.working'),
        onSubmit: (form) => {
            if (pending) return;
            setError(null);
            setPending(true);
            const formData = new FormData(form);
            void createApiToken(projectId, formData)
                .then((result) => {
                    setPlaintext(result.token);
                    form.reset();
                    router.refresh();
                })
                .catch((caught: unknown) => {
                    setError(caught instanceof Error ? caught.message : String(caught));
                })
                .finally(() => {
                    setPending(false);
                });
        },
    };
}
