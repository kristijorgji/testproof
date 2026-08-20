import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import { coveragePushBodySchema } from '@testproof/core';
import { coverageSnapshots, flowCoverage } from '@testproof/db';

import { getDb } from '../../db';
import { requireProjectToken } from '../middleware/token';

export const coverageRoutes = new OpenAPIHono();

coverageRoutes.use('/*', requireProjectToken);

const route = createRoute({
    method: 'post',
    path: '/',
    request: { body: { content: { 'application/json': { schema: coveragePushBodySchema } } } },
    responses: {
        200: {
            description: 'Stored',
            content: { 'application/json': { schema: z.object({ snapshotId: z.string() }) } },
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

coverageRoutes.openapi(route, async (c) => {
    const body = c.req.valid('json');
    const projectId = c.get('projectId');
    if (body.projectId !== projectId) return c.json({ error: 'project mismatch' }, 403);
    const db = getDb();
    const [snapshot] = await db
        .insert(coverageSnapshots)
        .values({
            projectId,
            commitSha: body.commitSha,
            branch: body.branch,
            summary: body.summary,
        })
        .returning();
    if (!snapshot) return c.json({ error: 'insert failed' }, 500);
    if (body.flows.length) {
        await db.insert(flowCoverage).values(
            body.flows.map((flow) => ({
                snapshotId: snapshot.id,
                flowId: flow.id,
                status: flow.status,
                demandedCells: flow.demanded ?? [],
                coveredCells: flow.covered ?? [],
                files: flow.platforms ?? {},
            })),
        );
    }
    return c.json({ snapshotId: snapshot.id }, 200);
});
