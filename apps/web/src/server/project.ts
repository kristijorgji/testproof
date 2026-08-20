import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { applyPatches, type LedgerPatch, openLedgerDocument, serializeLedgerDocument } from '@testproof/core';
import { drafts, projects, repos } from '@testproof/db';
import { and, desc, eq } from 'drizzle-orm';

import { getDb } from './db';
import { createOctokit } from './github/client';
import { readLedger } from './github/read';
import { getGithubAccessToken } from './session';

export async function getProject(projectId: string): Promise<typeof projects.$inferSelect | undefined> {
    const [project] = await getDb().select().from(projects).where(eq(projects.id, projectId)).limit(1);
    return project;
}

export async function getProjectRepo(projectId: string): Promise<typeof repos.$inferSelect | undefined> {
    const [repo] = await getDb().select().from(repos).where(eq(repos.projectId, projectId)).limit(1);
    return repo;
}

export async function getOpenDraft(projectId: string, userId: string): Promise<typeof drafts.$inferSelect | undefined> {
    const [draft] = await getDb()
        .select()
        .from(drafts)
        .where(and(eq(drafts.projectId, projectId), eq(drafts.authorId, userId), eq(drafts.status, 'open')))
        .orderBy(desc(drafts.updatedAt))
        .limit(1);
    const [stale] = draft
        ? [draft]
        : await getDb()
              .select()
              .from(drafts)
              .where(and(eq(drafts.projectId, projectId), eq(drafts.authorId, userId), eq(drafts.status, 'stale')))
              .orderBy(desc(drafts.updatedAt))
              .limit(1);
    return draft ?? stale;
}

export async function readProjectLedger(
    projectId: string,
    userId: string,
): Promise<{ content: string; sha: string; fromGithub: boolean }> {
    const project = await getProject(projectId);
    if (!project) throw new Error('Project not found');
    const repo = await getProjectRepo(projectId);
    const token = await getGithubAccessToken(userId);
    if (repo && token) {
        const file = await readLedger(createOctokit(token), {
            owner: repo.owner,
            repo: repo.name,
            path: project.ledgerPath,
            ref: project.defaultBranch,
        });
        return { ...file, fromGithub: true };
    }
    const content = fs.readFileSync(/* turbopackIgnore: true */ resolveLocalLedgerPath(), 'utf8');
    return { content, sha: createHash('sha1').update(content).digest('hex'), fromGithub: false };
}

/** Next starts from `apps/web`; Docker and CLI start from the repo root. */
export function resolveLocalLedgerPath(): string {
    const raw = process.env.LOCAL_LEDGER_PATH ?? 'examples/demo/flows.yaml';
    if (path.isAbsolute(raw)) {
        return raw;
    }
    let dir = process.cwd();
    for (let i = 0; i < 6; i += 1) {
        const candidate = path.join(/* turbopackIgnore: true */ dir, raw);
        if (fs.existsSync(/* turbopackIgnore: true */ candidate)) {
            return candidate;
        }
        const parent = path.dirname(dir);
        if (parent === dir) {
            break;
        }
        dir = parent;
    }
    return path.resolve(/* turbopackIgnore: true */ process.cwd(), raw);
}

export function applyDraft(source: string, patches: LedgerPatch[]): string {
    const doc = openLedgerDocument(source);
    applyPatches(doc, patches);
    return serializeLedgerDocument(doc);
}
