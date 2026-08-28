export const PROJECT_SPLIT_SIDEBAR_DEFAULT = 384;
export const PROJECT_SPLIT_SIDEBAR_MIN = 200;
export const PROJECT_SPLIT_SIDEBAR_MAX = 720;
export const PROJECT_SPLIT_SIDEBAR_STEP = 16;

const PROJECT_SPLIT_SIDEBAR_WIDTH_KEY = 'testproof.project-split-sidebar-width';

export function clampSidebarWidth(width: number): number {
    return Math.min(PROJECT_SPLIT_SIDEBAR_MAX, Math.max(PROJECT_SPLIT_SIDEBAR_MIN, Math.round(width)));
}

export function readStoredSidebarWidth(): number {
    if (typeof window === 'undefined') return PROJECT_SPLIT_SIDEBAR_DEFAULT;
    try {
        const raw = window.localStorage.getItem(PROJECT_SPLIT_SIDEBAR_WIDTH_KEY);
        if (!raw) return PROJECT_SPLIT_SIDEBAR_DEFAULT;
        const parsed = Number(raw);
        if (!Number.isFinite(parsed)) return PROJECT_SPLIT_SIDEBAR_DEFAULT;
        return clampSidebarWidth(parsed);
    } catch {
        return PROJECT_SPLIT_SIDEBAR_DEFAULT;
    }
}

export function writeStoredSidebarWidth(width: number): void {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(PROJECT_SPLIT_SIDEBAR_WIDTH_KEY, String(clampSidebarWidth(width)));
    } catch {
        // Ignore quota / private-mode failures.
    }
}
