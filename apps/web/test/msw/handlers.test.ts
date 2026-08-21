import { describe, expect, it } from 'vitest';

import { signInEmailHandler, signOutHandler, signUpEmailHandler } from './auth';
import { coveragePushHandler } from './coverage';
import { ledgerGetHandler, ledgerPutHandler } from './ledger';

describe('msw handlers', () => {
    it('constructs each documented handler', () => {
        expect(ledgerGetHandler({ yaml: '', revision: 1, storage: 'file' }).info.method).toBe('GET');
        expect(ledgerPutHandler({ revision: 2 }).info.method).toBe('PUT');
        expect(coveragePushHandler({ snapshotId: 's1' }).info.method).toBe('POST');
        expect(signInEmailHandler({}).info.method).toBe('POST');
        expect(signUpEmailHandler({}).info.method).toBe('POST');
        expect(signOutHandler().info.method).toBe('POST');
    });
});
