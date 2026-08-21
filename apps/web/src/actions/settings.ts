'use server';

import { createHash, randomBytes } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { apiTokens, projects, repos, STORAGE_MODES, type StorageMode } from '@testproof/db';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { getDb } from '@/server/db';
import { EMPTY_LEDGER_YAML, getLedgerSource, markDraftsStale, seedDbLedger } from '@/server/ledger-source';
import { requireUser } from '@/server/session';

export async function saveRepo(projectId: string, formData: FormData): Promise<void> {
    await requireUser();
    const owner = String(formData.get('owner') ?? '').trim();
    const name = String(formData.get('name') ?? '').trim();
    if (!owner || !name) throw new Error('Owner and repository name are required');
    const db = getDb();
    const existing = await db.select().from(repos).where(eq(repos.projectId, projectId)).limit(1);
    if (existing[0]) {
        await db.update(repos).set({ owner, name, updatedAt: new Date() }).where(eq(repos.id, existing[0].id));
    } else {
        await db.insert(repos).values({ projectId, owner, name });
    }
    revalidatePath(`/projects/${projectId}/settings`);
}

export async function createApiToken(projectId: string, formData: FormData): Promise<{ token: string }> {
    await requireUser();
    const name = String(formData.get('name') ?? '').trim() || 'CI';
    const token = `tp_${randomBytes(24).toString('hex')}`;
    const hash = createHash('sha256').update(token).digest('hex');
    await getDb().insert(apiTokens).values({ projectId, name, hash });
    revalidatePath(`/projects/${projectId}/settings`);
    return { token };
}

function isStorageMode(value: string): value is StorageMode {
    return (STORAGE_MODES as readonly string[]).includes(value);
}

export async function saveStorage(projectId: string, formData: FormData): Promise<void> {
    const user = await requireUser();
    const storage = String(formData.get('storage') ?? '').trim();
    if (!isStorageMode(storage)) throw new Error('Invalid storage mode');
    const ledgerPath = String(formData.get('ledgerPath') ?? '').trim() || 'docs/testing/flows.yaml';
    const ledgerFilePath = String(formData.get('ledgerFilePath') ?? '').trim();

    if (storage === 'file') {
        if (!path.isAbsolute(ledgerFilePath)) throw new Error('File storage requires an absolute path');
        if (!fs.existsSync(/* turbopackIgnore: true */ ledgerFilePath)) {
            throw new Error('Ledger file does not exist');
        }
        fs.accessSync(/* turbopackIgnore: true */ ledgerFilePath, fs.constants.W_OK);
    }

    let yaml = EMPTY_LEDGER_YAML;
    try {
        const source = await getLedgerSource(projectId, user.id);
        yaml = (await source.read()).content;
    } catch {
        // new or unreadable source — seed db mode from the empty ledger
    }

    await getDb()
        .update(projects)
        .set({
            storage,
            ledgerPath,
            ledgerFilePath: storage === 'file' ? ledgerFilePath : null,
            updatedAt: new Date(),
        })
        .where(eq(projects.id, projectId));

    if (storage === 'db') {
        await seedDbLedger(projectId, yaml);
    }
    await markDraftsStale(projectId);
    revalidatePath(`/projects/${projectId}/settings`);
    revalidatePath(`/projects/${projectId}/flows`);
}

export async function exportLedger(projectId: string): Promise<string> {
    const user = await requireUser();
    const source = await getLedgerSource(projectId, user.id);
    return (await source.read()).content;
}
