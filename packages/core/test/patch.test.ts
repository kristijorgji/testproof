import { describe, expect, it } from 'vitest';

import { openLedgerDocument, serializeLedgerDocument } from '../src/document.js';
import { parseLedger } from '../src/parse.js';
import { applyPatch } from '../src/patch.js';

const SOURCE = `version: 2
areas:
  - id: AUTH
    title: AUTH
    groups:
      - title: Login
        flows:
          - id: FLOW-AUTH-LOGIN
            title: Login
`;

describe('applyPatch flow fields', () => {
    it('sets and deletes flow metadata', () => {
        const doc = openLedgerDocument(SOURCE);
        applyPatch(doc, { op: 'set-flow-enum', flowId: 'FLOW-AUTH-LOGIN', field: 'priority', value: 'high' });
        applyPatch(doc, { op: 'set-flow-field', flowId: 'FLOW-AUTH-LOGIN', field: 'owner', value: 'qa' });
        applyPatch(doc, { op: 'set-flow-flag', flowId: 'FLOW-AUTH-LOGIN', field: 'flaky', value: true });
        applyPatch(doc, { op: 'set-flow-number', flowId: 'FLOW-AUTH-LOGIN', field: 'estimateMinutes', value: 12 });
        applyPatch(doc, { op: 'set-flow-list', flowId: 'FLOW-AUTH-LOGIN', field: 'tags', value: ['smoke'] });
        applyPatch(doc, { op: 'set-flow-flag', flowId: 'FLOW-AUTH-LOGIN', field: 'manual', value: true });
        applyPatch(doc, { op: 'set-flow-list', flowId: 'FLOW-AUTH-LOGIN', field: 'refs', value: ['REQ-1'] });
        const first = parseLedger(serializeLedgerDocument(doc)).areas[0]?.groups[0]?.flows[0];
        expect(first).toMatchObject({
            priority: 'high',
            owner: 'qa',
            flaky: true,
            estimateMinutes: 12,
            tags: ['smoke'],
            manual: true,
            refs: ['REQ-1'],
        });

        applyPatch(doc, { op: 'set-flow-enum', flowId: 'FLOW-AUTH-LOGIN', field: 'priority', value: null });
        applyPatch(doc, { op: 'set-flow-field', flowId: 'FLOW-AUTH-LOGIN', field: 'owner', value: null });
        applyPatch(doc, { op: 'set-flow-number', flowId: 'FLOW-AUTH-LOGIN', field: 'estimateMinutes', value: null });
        const cleared = parseLedger(serializeLedgerDocument(doc)).areas[0]?.groups[0]?.flows[0];
        expect(cleared?.priority).toBeUndefined();
        expect(cleared?.owner).toBeUndefined();
        expect(cleared?.estimateMinutes).toBeUndefined();
    });

    it('rejects invalid enum values', () => {
        const doc = openLedgerDocument(SOURCE);
        expect(() =>
            applyPatch(doc, { op: 'set-flow-enum', flowId: 'FLOW-AUTH-LOGIN', field: 'priority', value: 'urgent' }),
        ).toThrow();
    });
});
