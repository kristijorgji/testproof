import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import { runPushBodySchema } from '@testproof/core';
import { runResults, runs } from '@testproof/db';

import { getDb } from '../../db';
import { requireProjectToken } from '../middleware/token';

export const runsRoutes = new OpenAPIHono();
runsRoutes.use('/*', requireProjectToken);

const route = createRoute({
    method: 'post',
    path: '/',
    request: { body: { content: { 'application/json': { schema: runPushBodySchema } } } },
    responses: {
        200: {
            description: 'Stored',
            content: { 'application/json': { schema: z.object({ runId: z.string() }) } },
        },
        403: {
            description: 'Project token does not match body',
            content: { 'application/json': { schema: z.object({ error: z.string() }) } },
        },
        500: {
            description: 'Insert failed',
            content: { 'application/json': { schema: z.object({ error: z.string() }) } },
        },
    },
});

runsRoutes.openapi(route, async (c) => {
    const body = c.req.valid('json');
    const projectId = c.get('projectId') as string;
    if (body.projectId !== projectId) return c.json({ error: 'project mismatch' }, 403);
    const db = getDb();
    const [run] = await db
        .insert(runs)
        .values({
            projectId,
            source: body.source,
            commitSha: body.commitSha,
            branch: body.branch,
            startedAt: body.startedAt ? new Date(body.startedAt) : undefined,
            finishedAt: body.finishedAt ? new Date(body.finishedAt) : undefined,
            status: 'complete',
        })
        .returning();
    if (!run) return c.json({ error: 'insert failed' }, 500);
    if (body.results.length) {
        await db.insert(runResults).values(
            body.results.map((result) => ({
                runId: run.id,
                flowId: result.flowId,
                platform: result.platform,
                dimensions: result.dimensions ?? {},
                status: result.status,
                durationMs: result.durationMs,
                errorText: result.errorText,
            })),
        );
    }
    return c.json({ runId: run.id }, 200);
});
