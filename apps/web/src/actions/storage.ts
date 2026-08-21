'use server';

import { revalidatePath } from 'next/cache';

export async function saveStorage(projectId: string, formData: FormData): Promise<void> {
    const { requireUser } = await import('@/server/session');
    const { saveProjectStorage } = await import('@/server/ledger-source');
    const user = await requireUser();
    await saveProjectStorage(projectId, user.id, formData);
    revalidatePath(`/projects/${projectId}/settings`);
    revalidatePath(`/projects/${projectId}/flows`);
}

export async function exportLedger(projectId: string): Promise<string> {
    const { readProjectLedger } = await import('@/server/ledger-source');
    const { requireUser } = await import('@/server/session');
    const user = await requireUser();
    return (await readProjectLedger(projectId, user.id)).content;
}
