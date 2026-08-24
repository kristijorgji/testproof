import type { Flow, Ledger } from '@testproof/core';
import { describe, expect, it } from 'vitest';

import { filterLedgerForCoverage } from './coverage-filters';

import type { CoverageRow } from '@/lib/coverage-types';

const coverage: Record<string, CoverageRow> = {
    'FLOW-A': {
        status: 'automated',
        demanded: [{ platform: 'web', dimensions: {} }],
        covered: [{ platform: 'web', dimensions: {} }],
        files: { web: ['a.spec.ts'] },
    },
    'FLOW-B': {
        status: 'todo',
        demanded: [{ platform: 'mobile', dimensions: {} }],
        covered: [],
        files: {},
    },
};

const ledger: Ledger = {
    version: 2,
    platforms: [],
    areas: [
        {
            id: 'AUTH',
            title: 'Auth',
            groups: [
                {
                    title: 'Login',
                    flows: [
                        { id: 'FLOW-A', title: 'Sign in works', targets: ['web'] },
                        { id: 'FLOW-B', title: 'Sign in fails', targets: ['mobile'] },
                    ],
                },
            ],
        },
    ],
};

describe('filterLedgerForCoverage', () => {
    it('returns all areas when filters are empty', () => {
        const areas = filterLedgerForCoverage(ledger, '', 'all', new Set(), coverage);
        expect(areas).toHaveLength(1);
        expect(areas[0]?.groups[0]?.flows).toHaveLength(2);
    });

    it('filters by status', () => {
        const areas = filterLedgerForCoverage(ledger, '', 'automated', new Set(), coverage);
        const ids = areas.flatMap((area) => area.groups.flatMap((group) => group.flows.map((flow: Flow) => flow.id)));
        expect(ids).toEqual(['FLOW-A']);
    });

    it('filters by search query', () => {
        const areas = filterLedgerForCoverage(ledger, 'fails', 'all', new Set(), coverage);
        const ids = areas.flatMap((area) => area.groups.flatMap((group) => group.flows.map((flow: Flow) => flow.id)));
        expect(ids).toEqual(['FLOW-B']);
    });

    it('filters by platform using files data', () => {
        const areas = filterLedgerForCoverage(ledger, '', 'all', new Set(['web']), coverage);
        const ids = areas.flatMap((area) => area.groups.flatMap((group) => group.flows.map((flow: Flow) => flow.id)));
        expect(ids).toEqual(['FLOW-A']);
    });
});

describe('hierarchical platform filter', () => {
    const hierarchicalLedger: Ledger = {
        version: 2,
        platforms: [
            {
                id: 'web',
                title: 'Web',
                children: [
                    { id: 'web.chrome', title: 'Chrome' },
                    { id: 'web.safari', title: 'Safari' },
                ],
            },
        ],
        areas: [
            {
                id: 'AUTH',
                title: 'Auth',
                groups: [
                    {
                        title: 'Login',
                        flows: [{ id: 'FLOW-A', title: 'Sign in', targets: ['web'] }],
                    },
                ],
            },
        ],
    };

    const hierarchicalCoverage: Record<string, CoverageRow> = {
        'FLOW-A': {
            status: 'automated',
            demanded: [{ platform: 'web.chrome', dimensions: {} }],
            covered: [{ platform: 'web', dimensions: {} }],
            files: { web: ['a.spec.ts'] },
        },
    };

    it('matches parent filter to child demanded platforms', () => {
        const areas = filterLedgerForCoverage(hierarchicalLedger, '', 'all', new Set(['web']), hierarchicalCoverage);
        const ids = areas.flatMap((area) => area.groups.flatMap((group) => group.flows.map((flow: Flow) => flow.id)));
        expect(ids).toEqual(['FLOW-A']);
    });
});
