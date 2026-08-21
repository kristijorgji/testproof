const DEFAULT_AUTH_ORIGIN = 'http://localhost:3100';

export function resolveAuthClientBaseURL(env: { BETTER_AUTH_URL?: string }, locationOrigin?: string): string {
    if (locationOrigin) {
        return locationOrigin;
    }
    return env.BETTER_AUTH_URL ?? DEFAULT_AUTH_ORIGIN;
}
