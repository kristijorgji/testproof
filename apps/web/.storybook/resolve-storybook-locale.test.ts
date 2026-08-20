import { describe, expect, it } from 'vitest';

import { parseLocaleFromStorybookUrl, resolveStorybookLocale } from './resolve-storybook-locale';

describe('resolveStorybookLocale', () => {
    it('accepts en and de', () => {
        expect(resolveStorybookLocale('de')).toBe('de');
        expect(resolveStorybookLocale('nope')).toBe('en');
    });

    it('parses URL globals', () => {
        expect(parseLocaleFromStorybookUrl('?globals=theme:dark;locale:de')).toBe('de');
        expect(parseLocaleFromStorybookUrl('')).toBeNull();
    });
});
