import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import { ledgerPutBodySchema, parseLedger } from '@testproof/core';

import { getLedgerSource, RevisionConflictError } from '../../ledger-source';
import { requireProjectToken } from '../middleware/token';

export const ledgerRoutes = new OpenAPIHono();

ledgerRoutes.use('/*', requireProjectToken);

const getRoute = createRoute({
    method: 'get',
    path: '/',
    responses: {
        200: {
            description: 'Current ledger',
            content: {
                'application/json': {
                    schema: z.object({
                        yaml: z.string(),
                        revision: z.number().int(),
                        storage: z.enum(['git', 'file', 'db']),
                    }),
                },
            },
        },
        400: {
            description: 'Git mode or source error',
            content: { 'application/json': { schema: z.object({ error: z.string() }) } },
        },
    },
});

const putRoute = createRoute({
    method: 'put',
    path: '/',
    request: { body: { content: { 'application/json': { schema: ledgerPutBodySchema } } } },
    responses: {
        200: {
            description: 'Stored',
            content: { 'application/json': { schema: z.object({ revision: z.number().int() }) } },
        },
        400: {
            description: 'Git mode or invalid YAML',
            content: { 'application/json': { schema: z.object({ error: z.string() }) } },
        },
        409: {
            description: 'Stale revision',
            content: {
                'application/json': { schema: z.object({ error: z.string(), revision: z.number().int() }) },
            },
        },
    },
});

ledgerRoutes.openapi(getRoute, async (c) => {
    const projectId = c.get('projectId');
    try {
        const source = await getLedgerSource(projectId, '');
        if (source.kind === 'git') {
            return c.json({ error: 'ledger API is not available in git mode; commit to the repository instead' }, 400);
        }
        const file = await source.read();
        return c.json({ yaml: file.content, revision: file.revision, storage: source.kind }, 200);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return c.json({ error: message }, 400);
    }
});

ledgerRoutes.openapi(putRoute, async (c) => {
    const projectId = c.get('projectId');
    const body = c.req.valid('json');
    try {
        const source = await getLedgerSource(projectId, '');
        if (source.kind === 'git') {
            return c.json({ error: 'ledger API is not available in git mode; commit to the repository instead' }, 400);
        }
        parseLedger(body.yaml);
        await source.write(body.yaml, {
            message: body.message ?? 'testproof ledger push',
            baseRevision: body.baseRevision,
        });
        const next = await source.read();
        return c.json({ revision: next.revision }, 200);
    } catch (error) {
        if (error instanceof RevisionConflictError) {
            return c.json({ error: 'stale revision', revision: error.currentRevision }, 409);
        }
        const message = error instanceof Error ? error.message : String(error);
        return c.json({ error: message }, 400);
    }
});
