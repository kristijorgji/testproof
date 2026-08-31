import { describe, expect, it } from 'vitest';

import { isLedgerConfigError, isLedgerConfigErrorCode, LedgerConfigError } from './ledger-config-error';

describe('LedgerConfigError', () => {
    it('round-trips code and details', () => {
        const error = new LedgerConfigError('fileMissing', {
            path: '/data/flows.yaml',
            causeMessage: 'ENOENT',
        });
        expect(isLedgerConfigError(error)).toBe(true);
        expect(error.code).toBe('fileMissing');
        expect(error.path).toBe('/data/flows.yaml');
        expect(error.causeMessage).toBe('ENOENT');
        expect(error.message).toContain('/data/flows.yaml');
    });

    it('rejects unknown values as codes', () => {
        expect(isLedgerConfigErrorCode('fileMissing')).toBe(true);
        expect(isLedgerConfigErrorCode('not-a-code')).toBe(false);
        expect(isLedgerConfigError(new Error('fileMissing'))).toBe(false);
    });
});
