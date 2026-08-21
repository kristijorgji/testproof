import { createAuthClient } from 'better-auth/react';

import { resolveAuthClientBaseURL } from './auth-client-base-url';

export const authClient = createAuthClient({
    baseURL: resolveAuthClientBaseURL(
        { BETTER_AUTH_URL: process.env.BETTER_AUTH_URL },
        typeof window === 'undefined' ? undefined : window.location.origin,
    ),
});
