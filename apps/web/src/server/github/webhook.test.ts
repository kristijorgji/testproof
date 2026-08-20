import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import { verifyGithubSignature } from './webhook';

describe('verifyGithubSignature', () => {
    it('accepts a valid HMAC', () => {
        const payload = '{"ok":true}';
        const secret = 's3cret';
        const signature = `sha256=${createHmac('sha256', secret).update(payload).digest('hex')}`;
        expect(verifyGithubSignature(payload, signature, secret)).toBe(true);
    });

    it('rejects a bad signature', () => {
        expect(verifyGithubSignature('{}', 'sha256=nope', 's3cret')).toBe(false);
        expect(verifyGithubSignature('{}', undefined, 's3cret')).toBe(false);
    });
});
