import { describe, expect, it } from 'vitest';

import { flowIdPrefixForArea, formatFlowIdForDisplay } from './format-flow-id-display';

describe('formatFlowIdForDisplay', () => {
    it('strips the FLOW- prefix', () => {
        expect(formatFlowIdForDisplay('FLOW-AUTH-LOGIN')).toBe('AUTH-LOGIN');
    });

    it('leaves ids without the prefix unchanged', () => {
        expect(formatFlowIdForDisplay('AUTH-LOGIN')).toBe('AUTH-LOGIN');
    });
});

describe('flowIdPrefixForArea', () => {
    it('builds a create-form prefix for an area', () => {
        expect(flowIdPrefixForArea('AUTH')).toBe('FLOW-AUTH-');
    });
});
