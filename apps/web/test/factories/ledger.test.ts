import { describe, expect, it } from 'vitest';

import { DEMO_LEDGER, DEMO_LEDGER_YAML } from '../fixtures/ledger';

import { createArea, createFlow, createGroup, createLedger, createPlatformNode } from './ledger';

describe('ledger factories', () => {
    it('builds a nested ledger from the helpers', () => {
        const ledger = createLedger({
            platforms: [createPlatformNode(), createPlatformNode({ id: 'mobile', title: 'Mobile' })],
            areas: [createArea({ groups: [createGroup({ flows: [createFlow()] })] })],
        });
        expect(ledger.version).toBe(2);
        expect(ledger.areas[0]?.groups[0]?.flows[0]?.id).toBe('FLOW-AUTH-LOGIN-SUCCESS');
    });

    it('parses the demo fixture', () => {
        expect(DEMO_LEDGER.version).toBe(2);
        expect(DEMO_LEDGER_YAML).toContain('FLOW-AUTH-LOGIN-SUCCESS');
    });
});
