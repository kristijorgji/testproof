import type { Ledger } from '@testproof/core';
import { describe, expect, it } from 'vitest';

import { flowBreadcrumb } from './flow-breadcrumb';

describe('flowBreadcrumb', () => {
    it('includes the group subtitle in the path', () => {
        const ledger: Ledger = {
            version: 2,
            areas: [
                {
                    id: 'AUTH',
                    title: 'AUTH',
                    groups: [
                        {
                            title: 'Registration',
                            subtitle: 'a. Consumer',
                            flows: [
                                {
                                    id: 'FLOW-PARENT',
                                    title: 'Parent',
                                    children: [{ id: 'FLOW-CHILD', title: 'Child' }],
                                },
                            ],
                        },
                    ],
                },
            ],
        };
        expect(flowBreadcrumb(ledger, 'FLOW-CHILD')).toBe('AUTH / Registration — a. Consumer / Parent');
    });
});
