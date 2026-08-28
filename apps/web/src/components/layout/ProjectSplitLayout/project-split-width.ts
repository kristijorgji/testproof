export const PROJECT_SPLIT_SIDEBAR_DEFAULT = 384;
export const PROJECT_SPLIT_SIDEBAR_MIN = 200;
export const PROJECT_SPLIT_SIDEBAR_MAX = 1200;
export const PROJECT_SPLIT_SIDEBAR_STEP = 16;
export const PROJECT_SPLIT_DETAIL_MIN = 280;

const PROJECT_SPLIT_SIDEBAR_WIDTH_KEY = 'testproof.project-split-sidebar-width';

export function maxSidebarForViewport(viewportWidth: number): number {
    return Math.max(
        PROJECT_SPLIT_SIDEBAR_MIN,
        Math.min(PROJECT_SPLIT_SIDEBAR_MAX, viewportWidth - PROJECT_SPLIT_DETAIL_MIN),
    );
}

export function clampSidebarWidth(width: number, viewportWidth?: number): number {
    const max =
        typeof viewportWidth === 'number' && Number.isFinite(viewportWidth)
            ? maxSidebarForViewport(viewportWidth)
            : PROJECT_SPLIT_SIDEBAR_MAX;
    return Math.min(max, Math.max(PROJECT_SPLIT_SIDEBAR_MIN, Math.round(width)));
}

export function readStoredSidebarWidth(): number {
    if (typeof window === 'undefined') return PROJECT_SPLIT_SIDEBAR_DEFAULT;
    try {
        const raw = window.localStorage.getItem(PROJECT_SPLIT_SIDEBAR_WIDTH_KEY);
        if (!raw) return PROJECT_SPLIT_SIDEBAR_DEFAULT;
        const parsed = Number(raw);
        if (!Number.isFinite(parsed)) return PROJECT_SPLIT_SIDEBAR_DEFAULT;
        return clampSidebarWidth(parsed, window.innerWidth);
    } catch {
        return PROJECT_SPLIT_SIDEBAR_DEFAULT;
    }
}

export function writeStoredSidebarWidth(width: number): void {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(
            PROJECT_SPLIT_SIDEBAR_WIDTH_KEY,
            String(clampSidebarWidth(width, window.innerWidth)),
        );
    } catch {
        // Ignore quota / private-mode failures.
    }
}
