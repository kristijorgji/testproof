import { describe, expect, it } from 'vitest';

import { resolveAuthRedirectTarget } from './resolve-auth-redirect';

describe('resolveAuthRedirectTarget', () => {
    it('returns nextPath when sign-up succeeds without a redirect url', () => {
        expect(resolveAuthRedirectTarget({ data: {} }, '/projects')).toBe('/projects');
    });

    it('returns data.url when sign-in succeeds with a redirect hint', () => {
        expect(resolveAuthRedirectTarget({ data: { url: '/projects' } }, '/other')).toBe('/projects');
    });

    it('returns null when the auth call failed', () => {
        expect(resolveAuthRedirectTarget({ error: { message: 'Invalid credentials' } }, '/projects')).toBeNull();
    });
});
