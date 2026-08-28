import { describe, expect, it } from 'vitest';

import {
    clampSidebarWidth,
    maxSidebarForViewport,
    PROJECT_SPLIT_DETAIL_MIN,
    PROJECT_SPLIT_SIDEBAR_DEFAULT,
    PROJECT_SPLIT_SIDEBAR_MAX,
    PROJECT_SPLIT_SIDEBAR_MIN,
} from './project-split-width';

describe('clampSidebarWidth', () => {
    it('clamps below the minimum', () => {
        expect(clampSidebarWidth(100)).toBe(PROJECT_SPLIT_SIDEBAR_MIN);
    });

    it('clamps above the maximum', () => {
        expect(clampSidebarWidth(2000)).toBe(PROJECT_SPLIT_SIDEBAR_MAX);
    });

    it('respects viewport so the detail pane keeps space', () => {
        const viewport = 900;
        expect(clampSidebarWidth(2000, viewport)).toBe(viewport - PROJECT_SPLIT_DETAIL_MIN);
    });

    it('rounds values inside the range', () => {
        expect(clampSidebarWidth(PROJECT_SPLIT_SIDEBAR_DEFAULT + 0.6)).toBe(PROJECT_SPLIT_SIDEBAR_DEFAULT + 1);
    });
});

describe('maxSidebarForViewport', () => {
    it('never goes below the sidebar minimum', () => {
        expect(maxSidebarForViewport(400)).toBe(PROJECT_SPLIT_SIDEBAR_MIN);
    });
});
