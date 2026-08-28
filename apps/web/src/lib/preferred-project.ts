const PREFERRED_PROJECT_KEY = 'testproof.preferred-project-id';

export function readPreferredProjectId(): string | null {
    if (typeof window === 'undefined') return null;
    try {
        const value = window.localStorage.getItem(PREFERRED_PROJECT_KEY);
        return value && value.length > 0 ? value : null;
    } catch {
        return null;
    }
}

export function writePreferredProjectId(projectId: string): void {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(PREFERRED_PROJECT_KEY, projectId);
    } catch {
        // Ignore quota / private-mode failures.
    }
}

export function clearPreferredProjectId(): void {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.removeItem(PREFERRED_PROJECT_KEY);
    } catch {
        // Ignore quota / private-mode failures.
    }
}

export function resolveProjectsEntryPath(preferredId: string | null): string {
    if (preferredId) return `/projects/${preferredId}/flows`;
    return '/projects';
}

export function resolveAuthLandingPath(nextPath: string, preferredId: string | null): string {
    if (nextPath === '/projects' || nextPath === '/projects/') {
        return resolveProjectsEntryPath(preferredId);
    }
    return nextPath;
}

export function syncPreferredProjectId(projectIds: string[]): string | null {
    const preferred = readPreferredProjectId();
    if (preferred && projectIds.includes(preferred)) return preferred;
    if (preferred) clearPreferredProjectId();
    if (projectIds.length === 1) {
        const only = projectIds[0];
        if (only) {
            writePreferredProjectId(only);
            return only;
        }
    }
    return null;
}
