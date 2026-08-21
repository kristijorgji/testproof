import { describe, expect, it } from 'vitest';

import { resolveAuthClientBaseURL } from './auth-client-base-url';

describe('resolveAuthClientBaseURL', () => {
    it('uses the page origin in the browser so a remapped host port stays same-origin', () => {
        expect(resolveAuthClientBaseURL({ BETTER_AUTH_URL: 'http://localhost:3100' }, 'http://localhost:3110')).toBe(
            'http://localhost:3110',
        );
    });

    it('falls back to BETTER_AUTH_URL, then localhost:3100, when there is no page origin', () => {
        expect(resolveAuthClientBaseURL({ BETTER_AUTH_URL: 'http://localhost:3200' })).toBe('http://localhost:3200');
        expect(resolveAuthClientBaseURL({})).toBe('http://localhost:3100');
    });
});
