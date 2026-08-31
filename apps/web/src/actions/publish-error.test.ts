import { describe, expect, it } from 'vitest';

import { publishErrorCode } from './publish-error';

import { LedgerConfigError } from '@/lib/ledger-config-error';

describe('publishErrorCode', () => {
    it('maps filesystem errors', () => {
        expect(publishErrorCode({ code: 'ENOENT' })).toBe('fileMissing');
        expect(publishErrorCode({ code: 'EACCES' })).toBe('fileNotWritable');
        expect(publishErrorCode({ code: 'EROFS' })).toBe('fileNotWritable');
    });

    it('maps LedgerConfigError file codes', () => {
        expect(publishErrorCode(new LedgerConfigError('fileMissing', { path: '/data/flows.yaml' }))).toBe(
            'fileMissing',
        );
        expect(publishErrorCode(new LedgerConfigError('fileNotReadable', { path: '/data/flows.yaml' }))).toBe(
            'fileNotWritable',
        );
        expect(publishErrorCode(new LedgerConfigError('fileNotWritable', { path: '/data/flows.yaml' }))).toBe(
            'fileNotWritable',
        );
        expect(publishErrorCode(new LedgerConfigError('invalidLedger'))).toBe('publishFailed');
    });

    it('falls back for unknown errors', () => {
        expect(publishErrorCode(new Error('boom'))).toBe('publishFailed');
    });
});
