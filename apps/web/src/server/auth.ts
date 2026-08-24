import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

import { getDb } from './db';

const publicOrigin = process.env.BETTER_AUTH_URL ?? 'http://localhost:3100';
const githubClientId = process.env.GITHUB_CLIENT_ID?.trim() ?? '';
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET?.trim() ?? '';

export const auth = betterAuth({
    baseURL: publicOrigin,
    trustedOrigins: [publicOrigin],
    secret: process.env.BETTER_AUTH_SECRET ?? 'dev-only-change-me-please-replace',
    database: drizzleAdapter(getDb(), { provider: 'pg' }),
    emailAndPassword: { enabled: true },
    socialProviders:
        githubClientId && githubClientSecret
            ? {
                  github: {
                      clientId: githubClientId,
                      clientSecret: githubClientSecret,
                      scope: ['repo', 'read:user', 'user:email'],
                  },
              }
            : {},
});
