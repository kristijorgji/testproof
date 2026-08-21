export function createProject(overrides: Partial<{ id: string; name: string; slug: string }> = {}): {
    id: string;
    name: string;
    slug: string;
} {
    return { id: 'p1', name: 'Demo', slug: 'demo', ...overrides };
}

export function createRepo(overrides: Partial<{ owner: string; name: string }> = {}): { owner: string; name: string } {
    return { owner: 'acme', name: 'web', ...overrides };
}
