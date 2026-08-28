import { describe, expect, it } from 'vitest';

import { groupDisplayTitle } from './group-display-title';

describe('groupDisplayTitle', () => {
    it('returns title when subtitle is absent', () => {
        expect(groupDisplayTitle({ title: 'Login' })).toBe('Login');
    });

    it('joins title and subtitle with an em dash', () => {
        expect(groupDisplayTitle({ title: 'Registration', subtitle: 'a. Consumer' })).toBe(
            'Registration — a. Consumer',
        );
    });
});
