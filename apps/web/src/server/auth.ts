import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

import { getDb } from './db';

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3100',
    secret: process.env.BETTER_AUTH_SECRET ?? 'dev-only-change-me-please-replace',
    database: drizzleAdapter(getDb(), { provider: 'pg' }),
    emailAndPassword: { enabled: true },
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID ?? '',
            clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
            scope: ['repo', 'read:user', 'user:email'],
        },
    },
});
