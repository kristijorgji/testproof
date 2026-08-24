import type { CoverageRow } from '@/lib/coverage-types';

export function createCoverageRow(overrides: Partial<CoverageRow> = {}): CoverageRow {
    return {
        status: 'automated',
        demanded: [{ platform: 'web', dimensions: {} }],
        covered: [{ platform: 'web', dimensions: {} }],
        files: { web: ['home.spec.ts'] },
        ...overrides,
    };
}

export function createCoverageMap(overrides: Record<string, CoverageRow> = {}): Record<string, CoverageRow> {
    return {
        'FLOW-AUTH-LOGIN-SUCCESS': createCoverageRow(),
        ...overrides,
    };
}
