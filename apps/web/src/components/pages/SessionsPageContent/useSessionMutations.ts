'use client';

import { useTransition } from 'react';
import { useTranslation } from 'react-i18next';

export function useSessionMutations(
    createAction: (formData: FormData) => void | Promise<void>,
    deleteAction: (sessionId: string) => void | Promise<void>,
): {
    pending: boolean;
    submitCreate: (form: HTMLFormElement) => void;
    confirmDelete: (sessionId: string) => void;
} {
    const { t } = useTranslation();
    const [pending, startTransition] = useTransition();

    function submitCreate(form: HTMLFormElement): void {
        if (pending) return;
        const formData = new FormData(form);
        startTransition(async () => {
            await createAction(formData);
            form.reset();
        });
    }

    function confirmDelete(sessionId: string): void {
        if (pending) return;
        if (!window.confirm(t('sessions.confirmDelete'))) return;
        startTransition(async () => {
            await deleteAction(sessionId);
        });
    }

    return { pending, submitCreate, confirmDelete };
}
