'use client';

import { useTransition } from 'react';

export function useSessionMutations(
    createAction: (formData: FormData) => void | Promise<void>,
    deleteAction: (sessionId: string) => void | Promise<void>,
): {
    pending: boolean;
    submitCreate: (form: HTMLFormElement) => void;
    runDelete: (sessionId: string) => void;
} {
    const [pending, startTransition] = useTransition();

    function submitCreate(form: HTMLFormElement): void {
        if (pending) return;
        const formData = new FormData(form);
        startTransition(async () => {
            await createAction(formData);
            form.reset();
        });
    }

    function runDelete(sessionId: string): void {
        if (pending) return;
        startTransition(async () => {
            await deleteAction(sessionId);
        });
    }

    return { pending, submitCreate, runDelete };
}
