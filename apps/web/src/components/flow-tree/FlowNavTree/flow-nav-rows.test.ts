import type { Ledger } from '@testproof/core';
import { describe, expect, it } from 'vitest';

import {
    buildAddFlowPatch,
    buildIndentFlowPatch,
    buildMoveFlowPatch,
    buildOutdentFlowPatch,
} from '../FlowEditor/flow-editor-form-actions';

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

    it('includes group subtitle in the display title when present', () => {
        const ledger: Ledger = {
            version: 2,
            areas: [
                {
                    id: 'A',
                    title: 'Area A',
                    groups: [
                        {
                            title: 'Registration',
                            subtitle: 'a. Consumer',
                            flows: [{ id: 'FLOW-A', title: 'Validate' }],
                        },
                        {
                            title: 'Registration',
                            subtitle: 'b. Vendor',
                            flows: [{ id: 'FLOW-B', title: 'Confirm' }],
                        },
                    ],
                },
            ],
        };
        const rows = flattenVisibleNavRows(ledger, {
            collapsedAreaIds: new Set(),
            collapsedFlowIds: new Set(),
        });
        expect(rows.filter((row) => row.kind === 'group').map((row) => row.title)).toEqual([
            'a. Consumer',
            'b. Vendor',
        ]);
        expect(rows.filter((row) => row.kind === 'cluster').map((row) => `${row.key}:${row.title}`)).toEqual([
            'A::cluster::Registration:Registration',
        ]);
    });

    it('clusters same-title groups under a parent row', () => {
        const ledger: Ledger = {
            version: 2,
            areas: [
                {
                    id: 'AUTH',
                    title: 'AUTH',
                    groups: [
                        {
                            title: 'Registration',
                            subtitle: 'a. Consumer',
                            flows: [{ id: 'FLOW-A', title: 'Validate' }],
                        },
                        {
                            title: 'Registration',
                            subtitle: 'b. Vendor',
                            flows: [{ id: 'FLOW-B', title: 'Confirm' }],
                        },
                        { title: 'Login', flows: [{ id: 'FLOW-L', title: 'Login' }] },
                    ],
                },
            ],
        };
        const rows = flattenVisibleNavRows(ledger, {
            collapsedAreaIds: new Set(),
            collapsedFlowIds: new Set(),
        });
        expect(rows.map((row) => `${row.kind}:${row.key}`)).toEqual([
            'area:AUTH',
            'cluster:AUTH::cluster::Registration',
            'group:AUTH::0',
            'flow:FLOW-A',
            'group:AUTH::1',
            'flow:FLOW-B',
            'group:AUTH::2',
            'flow:FLOW-L',
        ]);
    });

    it('omits clustered groups when the cluster is collapsed', () => {
        const ledger: Ledger = {
            version: 2,
            areas: [
                {
                    id: 'AUTH',
                    title: 'AUTH',
                    groups: [
                        {
                            title: 'Registration',
                            subtitle: 'a. Consumer',
                            flows: [{ id: 'FLOW-A', title: 'Validate' }],
                        },
                        {
                            title: 'Registration',
                            subtitle: 'b. Vendor',
                            flows: [{ id: 'FLOW-B', title: 'Confirm' }],
                        },
                    ],
                },
            ],
        };
        const rows = flattenVisibleNavRows(ledger, {
            collapsedAreaIds: new Set(),
            collapsedFlowIds: new Set(),
            collapsedGroupKeys: new Set(['AUTH::cluster::Registration']),
        });
        expect(rows.map((row) => `${row.kind}:${row.key}`)).toEqual([
            'area:AUTH',
            'cluster:AUTH::cluster::Registration',
        ]);
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

    it('omits flows when a group is collapsed', () => {
        const rows = flattenVisibleNavRows(sampleLedger(), {
            collapsedAreaIds: new Set(),
            collapsedFlowIds: new Set(),
            collapsedGroupKeys: new Set(['A::0']),
        });
        expect(rows.map((row) => `${row.kind}:${row.key}`)).toEqual([
            'area:A',
            'group:A::0',
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

describe('indent and outdent', () => {
    it('indents a flow under its previous sibling', () => {
        const ledger = sampleLedger();
        // FLOW-OTHER is alone in B; add a second root in A after parent via sibling in B
        ledger.areas[1]?.groups[0]?.flows.push({ id: 'FLOW-SECOND', title: 'Second' });
        expect(buildIndentFlowPatch(ledger, 'FLOW-SECOND')).toEqual({
            op: 'move-flow',
            flowId: 'FLOW-SECOND',
            to: { areaId: 'B', groupIndex: 0, parentFlowId: 'FLOW-OTHER', index: 0 },
        });
    });

    it('outdents a child after its parent', () => {
        expect(buildOutdentFlowPatch(sampleLedger(), 'FLOW-CHILD')).toEqual({
            op: 'move-flow',
            flowId: 'FLOW-CHILD',
            to: { areaId: 'A', groupIndex: 0, index: 1 },
        });
    });
});
