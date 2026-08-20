'use server';

import { projects } from '@testproof/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { getDb } from '@/server/db';
import { requireUser } from '@/server/session';

export async function createProject(formData: FormData): Promise<void> {
    await requireUser();
    const name = String(formData.get('name') ?? '').trim();
    const slug = String(formData.get('slug') ?? '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, '-');
    if (!name || !slug) throw new Error('Name and slug are required');
    const [row] = await getDb().insert(projects).values({ name, slug, shareToken: crypto.randomUUID() }).returning();
    if (!row) throw new Error('Could not create project');
    revalidatePath('/projects');
    redirect(`/projects/${row.id}`);
}
