import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
    clearPreferredProjectId,
    readPreferredProjectId,
    resolveAuthLandingPath,
    resolveProjectsEntryPath,
    syncPreferredProjectId,
    writePreferredProjectId,
} from './preferred-project';

function installMemoryLocalStorage(): Map<string, string> {
    const store = new Map<string, string>();
    vi.stubGlobal('window', {
        localStorage: {
            getItem: (key: string) => store.get(key) ?? null,
            setItem: (key: string, value: string) => {
                store.set(key, value);
            },
            removeItem: (key: string) => {
                store.delete(key);
            },
            clear: () => {
                store.clear();
            },
        },
    });
    return store;
}

describe('preferred-project', () => {
    let store: Map<string, string>;

    beforeEach(() => {
        store = installMemoryLocalStorage();
    });

    afterEach(() => {
        store.clear();
        vi.unstubAllGlobals();
    });

    it('stores and clears preferred project id', () => {
        expect(readPreferredProjectId()).toBeNull();
        writePreferredProjectId('proj-1');
        expect(readPreferredProjectId()).toBe('proj-1');
        clearPreferredProjectId();
        expect(readPreferredProjectId()).toBeNull();
    });

    it('resolves entry path from preferred id', () => {
        expect(resolveProjectsEntryPath(null)).toBe('/projects');
        expect(resolveProjectsEntryPath('abc')).toBe('/projects/abc/flows');
    });

    it('only remaps the projects list path for auth landing', () => {
        expect(resolveAuthLandingPath('/projects', 'abc')).toBe('/projects/abc/flows');
        expect(resolveAuthLandingPath('/projects/xyz/settings', 'abc')).toBe('/projects/xyz/settings');
    });

    it('auto-pins the only project and clears stale preferred ids', () => {
        writePreferredProjectId('gone');
        expect(syncPreferredProjectId(['only'])).toBe('only');
        expect(readPreferredProjectId()).toBe('only');
        expect(syncPreferredProjectId(['a', 'b'])).toBeNull();
        expect(readPreferredProjectId()).toBeNull();
        writePreferredProjectId('gone');
        expect(syncPreferredProjectId(['a', 'b'])).toBeNull();
    });
});
