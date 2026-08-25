import type { Ledger } from '@testproof/core';
import { describe, expect, it } from 'vitest';

import { buildDropMovePatch } from './flow-nav-drop';

function sampleLedger(): Ledger {
    return {
        version: 2,
        areas: [
            {
                id: 'A',
                title: 'Area A',
                groups: [
                    {
                        title: 'Group A',
                        flows: [
                            {
                                id: 'FLOW-PARENT',
                                title: 'Parent',
                                children: [{ id: 'FLOW-CHILD', title: 'Child' }],
                            },
                        ],
                    },
                ],
            },
            {
                id: 'B',
                title: 'Area B',
                groups: [{ title: 'Group B', flows: [{ id: 'FLOW-OTHER', title: 'Other' }] }],
            },
        ],
    };
}

describe('buildDropMovePatch', () => {
    it('moves a flow onto another group as a top-level append (cross-area)', () => {
        expect(
            buildDropMovePatch({
                ledger: sampleLedger(),
                dragFlowId: 'FLOW-OTHER',
                overKey: 'A::0',
                overKind: 'group',
                zone: 'after',
            }),
        ).toEqual({
            op: 'move-flow',
            flowId: 'FLOW-OTHER',
            to: { areaId: 'A', groupIndex: 0, index: 1 },
        });
    });

    it('reparents a flow as the last child', () => {
        expect(
            buildDropMovePatch({
                ledger: sampleLedger(),
                dragFlowId: 'FLOW-OTHER',
                overKey: 'FLOW-PARENT',
                overKind: 'flow',
                zone: 'child',
            }),
        ).toEqual({
            op: 'move-flow',
            flowId: 'FLOW-OTHER',
            to: { areaId: 'A', groupIndex: 0, parentFlowId: 'FLOW-PARENT', index: 1 },
        });
    });

    it('rejects dropping a parent onto its descendant', () => {
        expect(
            buildDropMovePatch({
                ledger: sampleLedger(),
                dragFlowId: 'FLOW-PARENT',
                overKey: 'FLOW-CHILD',
                overKind: 'flow',
                zone: 'child',
            }),
        ).toBeNull();
    });
});
