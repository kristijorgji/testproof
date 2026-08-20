import { OpenAPIHono } from '@hono/zod-openapi';
import { and, eq } from 'drizzle-orm';
import { drafts, projects, repos } from '@testproof/db';

import { getDb } from '../../db';
import { verifyGithubSignature } from '../../github/webhook';

export const githubWebhook = new OpenAPIHono();

githubWebhook.post('/', async (c) => {
    const secret = process.env.GITHUB_WEBHOOK_SECRET ?? '';
    const payload = await c.req.text();
    if (!verifyGithubSignature(payload, c.req.header('x-hub-signature-256'), secret)) {
        return c.json({ error: 'invalid signature' }, 401);
    }
    const event = JSON.parse(payload) as {
        ref?: string;
        repository?: { owner?: { login?: string }; name?: string };
        commits?: Array<{ modified?: string[]; added?: string[]; removed?: string[] }>;
    };
    const owner = event.repository?.owner?.login;
    const name = event.repository?.name;
    if (!owner || !name) return c.json({ ok: true });
    const db = getDb();
    const repoRows = await db.select().from(repos).where(and(eq(repos.owner, owner), eq(repos.name, name)));
    for (const repo of repoRows) {
        const [project] = await db.select().from(projects).where(eq(projects.id, repo.projectId)).limit(1);
        if (!project) continue;
        const touched = (event.commits ?? []).some((commit) =>
            [...(commit.modified ?? []), ...(commit.added ?? []), ...(commit.removed ?? [])].includes(project.ledgerPath),
        );
        if (!touched) continue;
        await db
            .update(drafts)
            .set({ status: 'stale', updatedAt: new Date() })
            .where(and(eq(drafts.projectId, project.id), eq(drafts.status, 'open')));
    }
    return c.json({ ok: true });
});
