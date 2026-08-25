import type { Ledger } from '@testproof/core';
import { describe, expect, it } from 'vitest';

import { buildAddFlowPatch, buildMoveFlowPatch } from '../FlowEditor/flow-editor-form-actions';

import { collectAncestorIds, findFlowLocation, flattenVisibleNavRows, isDescendantFlow } from './flow-nav-rows';

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

describe('flattenVisibleNavRows', () => {
    it('emits areas, groups, and flows when nothing is collapsed', () => {
        const rows = flattenVisibleNavRows(sampleLedger(), {
            collapsedAreaIds: new Set(),
            collapsedFlowIds: new Set(),
        });
        expect(rows.map((row) => `${row.kind}:${row.key}`)).toEqual([
            'area:A',
            'group:A::0',
            'flow:FLOW-PARENT',
            'flow:FLOW-CHILD',
            'area:B',
            'group:B::0',
            'flow:FLOW-OTHER',
        ]);
    });

    it('omits children when a parent flow is collapsed', () => {
        const rows = flattenVisibleNavRows(sampleLedger(), {
            collapsedAreaIds: new Set(),
            collapsedFlowIds: new Set(['FLOW-PARENT']),
        });
        expect(rows.some((row) => row.kind === 'flow' && row.id === 'FLOW-CHILD')).toBe(false);
        expect(rows.some((row) => row.kind === 'flow' && row.id === 'FLOW-PARENT')).toBe(true);
    });

    it('omits groups and flows when an area is collapsed', () => {
        const rows = flattenVisibleNavRows(sampleLedger(), {
            collapsedAreaIds: new Set(['A']),
            collapsedFlowIds: new Set(),
        });
        expect(rows.map((row) => `${row.kind}:${row.key}`)).toEqual([
            'area:A',
            'area:B',
            'group:B::0',
            'flow:FLOW-OTHER',
        ]);
    });
});

describe('findFlowLocation', () => {
    it('returns parentFlowId for nested children', () => {
        expect(findFlowLocation(sampleLedger(), 'FLOW-CHILD')).toEqual({
            areaId: 'A',
            groupIndex: 0,
            parentFlowId: 'FLOW-PARENT',
            index: 0,
            siblingCount: 1,
        });
    });
});

describe('collectAncestorIds', () => {
    it('walks parentFlowId chain', () => {
        expect(collectAncestorIds(sampleLedger(), 'FLOW-CHILD')).toEqual(['FLOW-PARENT']);
        expect(collectAncestorIds(sampleLedger(), 'FLOW-PARENT')).toEqual([]);
    });
});

describe('isDescendantFlow', () => {
    it('detects nested descendants', () => {
        const ledger = sampleLedger();
        expect(isDescendantFlow(ledger, 'FLOW-PARENT', 'FLOW-CHILD')).toBe(true);
        expect(isDescendantFlow(ledger, 'FLOW-CHILD', 'FLOW-PARENT')).toBe(false);
        expect(isDescendantFlow(ledger, 'FLOW-PARENT', 'FLOW-OTHER')).toBe(false);
    });
});

describe('buildAddFlowPatch', () => {
    it('nests under createParentId', () => {
        const ledger = sampleLedger();
        const result = buildAddFlowPatch({
            ledger,
            flows: [],
            newFlowId: 'FLOW-NESTED',
            newFlowTitle: 'Nested',
            createGroupKey: 'A::0',
            createParentId: 'FLOW-PARENT',
        });
        expect(result.patch).toMatchObject({
            op: 'add-flow',
            parent: { areaId: 'A', groupIndex: 0, parentFlowId: 'FLOW-PARENT' },
            index: 1,
        });
    });
});

describe('buildMoveFlowPatch', () => {
    it('is a no-op when a nested child has no sibling to swap with', () => {
        expect(buildMoveFlowPatch(sampleLedger(), 'FLOW-CHILD', 1)).toBeNull();
        expect(buildMoveFlowPatch(sampleLedger(), 'FLOW-CHILD', -1)).toBeNull();
    });
});
