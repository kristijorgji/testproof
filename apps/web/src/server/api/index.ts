import { OpenAPIHono } from '@hono/zod-openapi';

import { coverageRoutes } from './v1/coverage';
import { runsRoutes } from './v1/runs';
import { githubWebhook } from './webhooks/github';

export const api = new OpenAPIHono().basePath('/api');

api.route('/v1/coverage', coverageRoutes);
api.route('/v1/runs', runsRoutes);
api.route('/webhooks/github', githubWebhook);
api.doc('/v1/openapi.json', { openapi: '3.1.0', info: { title: 'Testproof', version: '1' } });
