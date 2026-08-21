import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { drafts, ledgerDocuments, projects, repos, type StorageMode } from '@testproof/db';
import { and, eq } from 'drizzle-orm';

import { getDb } from './db';
import { createOctokit } from './github/client';
import { publishCommit, PublishConflictError, publishPullRequest } from './github/publish';
import { readLedger } from './github/read';
import { getGithubAccessToken } from './session';

export const EMPTY_LEDGER_YAML = `version: 2
areas:
  - id: HOME
    title: HOME
    groups:
      - title: Home
        flows:
          - id: FLOW-HOME-OPENS
            title: Page opens
`;

export interface LedgerRead {
    content: string;
    sha: string;
    revision: number;
}

export interface LedgerWriteOpts {
    message: string;
    pullRequest?: boolean;
    baseRevision?: number;
}

export interface LedgerSource {
    readonly kind: StorageMode;
    readonly canPullRequest: boolean;
    read(): Promise<LedgerRead>;
    write(yaml: string, opts: LedgerWriteOpts): Promise<void>;
}

let warnedLocalEnv = false;

function revisionFromSha(sha: string): number {
    return Number.parseInt(sha.slice(0, 8), 16);
}

function shaOf(content: string): string {
    return createHash('sha1').update(content).digest('hex');
}

function resolveDeprecatedEnvPath(): string {
    if (!warnedLocalEnv) {
        console.warn('LOCAL_LEDGER_PATH is deprecated; set a per-project file path in Settings');
        warnedLocalEnv = true;
    }
    const raw = process.env.LOCAL_LEDGER_PATH ?? 'examples/demo/flows.yaml';
    if (path.isAbsolute(raw)) return raw;
    let dir = process.cwd();
    for (let i = 0; i < 6; i += 1) {
        const candidate = path.join(/* turbopackIgnore: true */ dir, raw);
        if (fs.existsSync(/* turbopackIgnore: true */ candidate)) return candidate;
        const parent = path.dirname(dir);
        if (parent === dir) break;
        dir = parent;
    }
    return path.resolve(/* turbopackIgnore: true */ process.cwd(), raw);
}

class GitLedgerSource implements LedgerSource {
    readonly kind = 'git' as const;
    readonly canPullRequest = true;

    constructor(
        private readonly owner: string,
        private readonly repo: string,
        private readonly ledgerPath: string,
        private readonly branch: string,
        private readonly token: string,
    ) {}

    async read(): Promise<LedgerRead> {
        const file = await readLedger(createOctokit(this.token), {
            owner: this.owner,
            repo: this.repo,
            path: this.ledgerPath,
            ref: this.branch,
        });
        return { content: file.content, sha: file.sha, revision: revisionFromSha(file.sha) };
    }

    async write(yaml: string, opts: LedgerWriteOpts): Promise<void> {
        const current = await this.read();
        const octokit = createOctokit(this.token);
        if (opts.pullRequest) {
            await publishPullRequest(octokit, {
                owner: this.owner,
                repo: this.repo,
                path: this.ledgerPath,
                baseBranch: this.branch,
                headBranch: `testproof/${Date.now()}`,
                message: opts.message,
                yaml,
                baseBlobSha: current.sha,
            });
            return;
        }
        await publishCommit(octokit, {
            owner: this.owner,
            repo: this.repo,
            path: this.ledgerPath,
            branch: this.branch,
            message: opts.message,
            baseBlobSha: current.sha,
            yaml,
        });
    }
}

class FileLedgerSource implements LedgerSource {
    readonly kind = 'file' as const;
    readonly canPullRequest = false;

    constructor(private readonly filePath: string) {}

    async read(): Promise<LedgerRead> {
        const content = fs.readFileSync(/* turbopackIgnore: true */ this.filePath, 'utf8');
        const sha = shaOf(content);
        return { content, sha, revision: revisionFromSha(sha) };
    }

    async write(yaml: string, opts: LedgerWriteOpts): Promise<void> {
        const current = await this.read();
        if (opts.baseRevision !== undefined && opts.baseRevision !== current.revision) {
            throw new RevisionConflictError(current.revision);
        }
        fs.mkdirSync(/* turbopackIgnore: true */ path.dirname(this.filePath), { recursive: true });
        fs.writeFileSync(/* turbopackIgnore: true */ this.filePath, yaml);
    }
}

class DbLedgerSource implements LedgerSource {
    readonly kind = 'db' as const;
    readonly canPullRequest = false;

    constructor(private readonly projectId: string) {}

    async read(): Promise<LedgerRead> {
        const [row] = await getDb()
            .select()
            .from(ledgerDocuments)
            .where(eq(ledgerDocuments.projectId, this.projectId))
            .limit(1);
        if (!row) throw new Error('No ledger document. Switch storage to db in Settings to seed one.');
        return { content: row.yaml, sha: shaOf(row.yaml), revision: row.revision };
    }

    async write(yaml: string, opts: LedgerWriteOpts): Promise<void> {
        const db = getDb();
        const [row] = await db
            .select()
            .from(ledgerDocuments)
            .where(eq(ledgerDocuments.projectId, this.projectId))
            .limit(1);
        if (!row) {
            await db.insert(ledgerDocuments).values({ projectId: this.projectId, yaml, revision: 1 });
            return;
        }
        if (opts.baseRevision !== undefined && opts.baseRevision !== row.revision) {
            throw new RevisionConflictError(row.revision);
        }
        await db
            .update(ledgerDocuments)
            .set({ yaml, revision: row.revision + 1, updatedAt: new Date() })
            .where(eq(ledgerDocuments.id, row.id));
    }
}

export class RevisionConflictError extends Error {
    readonly currentRevision: number;

    constructor(currentRevision: number) {
        super('ledger revision is stale');
        this.name = 'RevisionConflictError';
        this.currentRevision = currentRevision;
    }
}

export async function getLedgerSource(projectId: string, userId: string): Promise<LedgerSource> {
    const [project] = await getDb().select().from(projects).where(eq(projects.id, projectId)).limit(1);
    if (!project) throw new Error('Project not found');
    const storage = STORAGE_OR_DEFAULT(project.storage);

    if (storage === 'git') {
        const [repo] = await getDb().select().from(repos).where(eq(repos.projectId, projectId)).limit(1);
        const token = userId ? await getGithubAccessToken(userId) : undefined;
        if (!repo) throw new Error('Connect a GitHub repository in Settings');
        if (!token) throw new Error('Connect a GitHub account to read or publish a git ledger');
        return new GitLedgerSource(repo.owner, repo.name, project.ledgerPath, project.defaultBranch, token);
    }

    if (storage === 'file') {
        const raw = project.ledgerFilePath ?? resolveDeprecatedEnvPath();
        if (!path.isAbsolute(raw)) {
            throw new Error('File storage requires an absolute ledger path');
        }
        return new FileLedgerSource(raw);
    }

    return new DbLedgerSource(projectId);
}

function STORAGE_OR_DEFAULT(value: string): StorageMode {
    if (value === 'git' || value === 'file' || value === 'db') return value;
    return 'git';
}

export async function seedDbLedger(projectId: string, yaml: string): Promise<void> {
    const db = getDb();
    const [existing] = await db.select().from(ledgerDocuments).where(eq(ledgerDocuments.projectId, projectId)).limit(1);
    if (existing) {
        await db
            .update(ledgerDocuments)
            .set({ yaml, revision: existing.revision + 1, updatedAt: new Date() })
            .where(eq(ledgerDocuments.id, existing.id));
        return;
    }
    await db.insert(ledgerDocuments).values({ projectId, yaml, revision: 1 });
}

export async function markDraftsStale(projectId: string): Promise<void> {
    await getDb()
        .update(drafts)
        .set({ status: 'stale', updatedAt: new Date() })
        .where(and(eq(drafts.projectId, projectId), eq(drafts.status, 'open')));
}

export { PublishConflictError };
