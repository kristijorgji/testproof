import { describe, expect, it } from 'vitest';

import {
    clampSidebarWidth,
    PROJECT_SPLIT_SIDEBAR_DEFAULT,
    PROJECT_SPLIT_SIDEBAR_MAX,
    PROJECT_SPLIT_SIDEBAR_MIN,
} from './project-split-width';

describe('clampSidebarWidth', () => {
    it('clamps below the minimum', () => {
        expect(clampSidebarWidth(100)).toBe(PROJECT_SPLIT_SIDEBAR_MIN);
    });

    it('clamps above the maximum', () => {
        expect(clampSidebarWidth(900)).toBe(PROJECT_SPLIT_SIDEBAR_MAX);
    });

    it('rounds values inside the range', () => {
        expect(clampSidebarWidth(PROJECT_SPLIT_SIDEBAR_DEFAULT + 0.6)).toBe(PROJECT_SPLIT_SIDEBAR_DEFAULT + 1);
    });
});
