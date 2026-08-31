import { DEMO_LEDGER_YAML } from '@test/fixtures/ledger';
import { describe, expect, it } from 'vitest';

import { loadWorkingLedger } from './working-ledger';

import { isLedgerConfigError } from '@/lib/ledger-config-error';

describe('loadWorkingLedger', () => {
    it('parses a valid ledger and applies no patches', () => {
        const { afterYaml, ledger } = loadWorkingLedger(DEMO_LEDGER_YAML, []);
        expect(afterYaml).toContain('FLOW-AUTH-LOGIN-SUCCESS');
        expect(ledger.areas[0]?.id).toBe('AUTH');
    });

    it('maps parse failures to invalidLedger', () => {
        try {
            loadWorkingLedger('not: valid: yaml: [', []);
            expect.fail('expected LedgerConfigError');
        } catch (error) {
            expect(isLedgerConfigError(error)).toBe(true);
            if (isLedgerConfigError(error)) {
                expect(error.code).toBe('invalidLedger');
                expect(error.causeMessage).toBeTruthy();
            }
        }
    });
});
