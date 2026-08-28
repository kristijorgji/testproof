import type { Ledger } from '@testproof/core';
import { describe, expect, it, vi } from 'vitest';

import { dispatchFlowChange } from './dispatchFlowChange';
import { nextSelectedAfterDelete } from './flow-editor-form-actions';
import { collectDeletedFlowIds, nextFlowIdAfterDelete } from './flow-editor-helpers';

function nestedLedger(): Ledger {
    return {
        version: 2,
        areas: [
            {
                id: 'A',
                title: 'Area A',
                groups: [
                    {
                        title: 'Group',
                        flows: [
                            {
                                id: 'FLOW-PARENT',
                                title: 'Parent',
                                children: [
                                    {
                                        id: 'FLOW-CHILD',
                                        title: 'Child',
                                        children: [{ id: 'FLOW-GRAND', title: 'Grand' }],
                                    },
                                ],
                            },
                            { id: 'FLOW-SIBLING', title: 'Sibling' },
                        ],
                    },
                ],
            },
        ],
    };
}

describe('nextFlowIdAfterDelete', () => {
    it('skips descendants of the deleted flow', () => {
        const ledger = nestedLedger();
        expect(collectDeletedFlowIds(ledger, 'FLOW-PARENT')).toEqual(
            new Set(['FLOW-PARENT', 'FLOW-CHILD', 'FLOW-GRAND']),
        );
        expect(nextFlowIdAfterDelete(ledger, 'FLOW-PARENT')).toBe('FLOW-SIBLING');
    });

    it('selects the previous surviving flow when deleting the last node', () => {
        expect(nextFlowIdAfterDelete(nestedLedger(), 'FLOW-SIBLING')).toBe('FLOW-GRAND');
    });
});

describe('nextSelectedAfterDelete', () => {
    it('replaces selection when a descendant of the deleted flow is selected', () => {
        const ledger = nestedLedger();
        expect(nextSelectedAfterDelete(ledger, 'FLOW-PARENT', 'FLOW-CHILD')).toBe('FLOW-SIBLING');
        expect(nextSelectedAfterDelete(ledger, 'FLOW-PARENT', 'FLOW-SIBLING')).toBe('FLOW-SIBLING');
    });
});

describe('dispatchFlowChange', () => {
    it('emits trimmed titles and ignores empty titles', () => {
        const apply = vi.fn();
        dispatchFlowChange('FLOW-X', { title: '  Hello  ' }, apply);
        expect(apply).toHaveBeenCalledWith({
            op: 'set-flow-field',
            flowId: 'FLOW-X',
            field: 'title',
            value: 'Hello',
        });
        apply.mockClear();
        dispatchFlowChange('FLOW-X', { title: '   ' }, apply);
        expect(apply).not.toHaveBeenCalled();
    });
});
