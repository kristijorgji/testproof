const PERFORMED_AT = new Date('2026-01-15T12:00:00.000Z');

export function createSession(
    overrides: Partial<{ id: string; title: string; performedAt: Date; notes: string | null }> = {},
): { id: string; title: string; performedAt: Date; notes: string | null } {
    return {
        id: 'sess-1',
        title: 'Manual pass of login',
        performedAt: PERFORMED_AT,
        notes: null,
        ...overrides,
    };
}
