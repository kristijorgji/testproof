import { describe, expect, it } from 'vitest';

import { defaultProjectStorageFromEnv } from './default-project-storage';

describe('defaultProjectStorageFromEnv', () => {
    it('returns file storage when both env vars are set with an absolute path', () => {
        expect(
            defaultProjectStorageFromEnv({
                TESTPROOF_DEFAULT_STORAGE: 'file',
                TESTPROOF_DEFAULT_LEDGER_FILE: '/data/flows.yaml',
            }),
        ).toEqual({ storage: 'file', ledgerFilePath: '/data/flows.yaml' });
    });

    it('returns undefined unless storage is file with an absolute ledger path', () => {
        expect(defaultProjectStorageFromEnv({})).toBeUndefined();
        expect(
            defaultProjectStorageFromEnv({
                TESTPROOF_DEFAULT_STORAGE: 'file',
                TESTPROOF_DEFAULT_LEDGER_FILE: 'relative/flows.yaml',
            }),
        ).toBeUndefined();
        expect(
            defaultProjectStorageFromEnv({
                TESTPROOF_DEFAULT_STORAGE: 'git',
                TESTPROOF_DEFAULT_LEDGER_FILE: '/data/flows.yaml',
            }),
        ).toBeUndefined();
    });
});
