import { createHmac, timingSafeEqual } from 'node:crypto';

export function verifyGithubSignature(payload: string, signature: string | undefined, secret: string): boolean {
    if (!signature?.startsWith('sha256=')) return false;
    const expected = `sha256=${createHmac('sha256', secret).update(payload).digest('hex')}`;
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
}
