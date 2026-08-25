import { describe, expect, it } from 'vitest';

import { publishErrorCode } from './publish-error';

describe('publishErrorCode', () => {
    it('maps filesystem errors', () => {
        expect(publishErrorCode({ code: 'ENOENT' })).toBe('fileMissing');
        expect(publishErrorCode({ code: 'EACCES' })).toBe('fileNotWritable');
        expect(publishErrorCode({ code: 'EROFS' })).toBe('fileNotWritable');
    });

    it('falls back for unknown errors', () => {
        expect(publishErrorCode(new Error('boom'))).toBe('publishFailed');
    });
});
