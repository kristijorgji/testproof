'use server';

import { sessions } from '@testproof/db';
import { revalidatePath } from 'next/cache';

import { getDb } from '@/server/db';
import { requireUser } from '@/server/session';

export async function createSession(projectId: string, formData: FormData): Promise<void> {
    const user = await requireUser();
    const title = String(formData.get('title') ?? '').trim();
    const notes = String(formData.get('notes') ?? '').trim() || null;
    if (!title) throw new Error('Title is required');
    await getDb().insert(sessions).values({
        projectId,
        title,
        notes,
        performerId: user.id,
    });
    revalidatePath(`/projects/${projectId}/sessions`);
}
