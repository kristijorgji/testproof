const PERFORMED_AT = new Date('2026-01-15T12:00:00.000Z');

export function createRun(overrides: Partial<{ id: string; source: string; status: string; createdAt: Date }> = {}): {
    id: string;
    source: string;
    status: string;
    createdAt: Date;
} {
    return {
        id: 'run-1',
        source: 'ci',
        status: 'complete',
        createdAt: PERFORMED_AT,
        ...overrides,
    };
}

export function createRunResult(
    overrides: Partial<{ id: string; flowId: string | null; platform: string | null; status: string }> = {},
): { id: string; flowId: string | null; platform: string | null; status: string } {
    return {
        id: 'rr-1',
        flowId: 'FLOW-AUTH-LOGIN-SUCCESS',
        platform: 'web',
        status: 'pass',
        ...overrides,
    };
}
